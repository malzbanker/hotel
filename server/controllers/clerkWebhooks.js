// import User from "../models/User.js";
// import { Webhook } from "svix";


// const clerkWebhooks = async (req, res) => {
//     try {
//         // Create a svix instance with clerk webhook secret.
//         const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        
//         //Getting Headers
//         const headers = {
//             "svix-id": req.headers["svix-id"],
//             "svix-timestamp": req.headers["svix-timestamp"],
//             "svix-signature": req.headers["svix-signature"],
//         };

//         // Verifying Headers
//         await whook.verify(JSON.stringify(req.body), headers)
        
//         // Getting Data from request body
//         const { data, type } = req.body
        
//         const userData = {
//             _id: data.id,
//             email: data.email_addresses[0].email_address,
//             username: data.first_name + " " + data.last_name,
//             image:data.image_url,
//         }

//         //Switch Case for different Events
//         switch (type) {
//             case "user.created": {
//                 await User.create(userData);
//                 break;
//             }
                
//             case "user.updated": {
//                 await User.findByIdAndUpdate(data.id, userData);
//                 break;
//             }
                
//             case "user.deleted": {
//                 await User.findByIdAndDelete(data.id);
//                 break;
//             }
        
//             default:
//                 break;
//         }
//         res.json({ success: true, message: "Webhook Recieved" })
        
//     } catch (error) {
//         console.error("Webhook verification failed:", error);
//         res.json({ success: false, message: error.message });
//     }
// }


// export default clerkWebhooks;




import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // ✅ Verify request (no stringify, req.body is Buffer)
        const evt = wh.verify(req.body, headers);
        const { data, type } = evt;

        const userData = {
            _id: data.id,
            email: data.email_addresses?.[0]?.email_address,
            username: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
            image: data.image_url,
        };

        console.log("Webhook event type:", type);
        console.log("User data:", userData);

        switch (type) {
            case "user.created":
                await User.create(userData);
                break;

            case "user.updated":
                await User.findByIdAndUpdate(data.id, userData);
                break;

            case "user.deleted":
                await User.findByIdAndDelete(data.id);
                break;

            default:
                console.log("Unhandled event type:", type);
        }

        res.status(200).json({ success: true, message: "Webhook received" });
    } catch (error) {
        console.error("Webhook error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;





