import axios from "axios"
import Shopify from "shopify-api-node"
import { format } from "date-fns"

const { MAILER_LITE_KEY, SHOPIFY_API_KEY, SHOPIFY_SHOP_NAME, SHOPIFY_PASSWORD } = process.env

const shopify = new Shopify({
    shopName: SHOPIFY_SHOP_NAME,
    apiKey: SHOPIFY_API_KEY,
    password: SHOPIFY_PASSWORD
})

const mailerLite = axios.create({
    baseURL: "https://api.mailerlite.com/api/v2",
    headers: {
        "X-MailerLite-ApiKey": MAILER_LITE_KEY,
        "Content-Type": "application/json"
    }
})

;(async function () {
    const subscribersResponse = await mailerLite.get("/subscribers")
    const subscribers = subscribersResponse.data

    for (let subscriber of subscribers) {
        const getField = name => subscriber.fields.find(field => field.key === name).value

        try {
            // get the user data from shopify
            const shopifyId = getField("shopify_id")
            if (!shopifyId) continue

            const user = await shopify.customer.get(shopifyId)
            if (!user.last_order_id) continue
            const { last_order_id } = user

            // find when the last order happened
            const lastOrder = await shopify.order.get(last_order_id)
            const {
                // https://community.shopify.com/c/Shopify-APIs-SDKs/Is-it-expected-that-processed-at-can-be-larger-than-created-at/m-p/596219/highlight/true#M40287
                // this is <= created_at + c where c <= a few seconds
                processed_at
            } = lastOrder
            if (!processed_at) continue

            // add the last order time to mailerlite
            const lastOrderDate = new Date(processed_at)
            const subscribersUpdate = await mailerLite.put(`/subscribers/${subscriber.email}`, {
                fields: {
                    // 2020-09-30 00:15:58
                    last_order_time: format(lastOrderDate, "yyyy-LL-dd HH:mm:ss")
                }
            })
        } catch (error) {
            console.error(error)
        }
    }
})()
