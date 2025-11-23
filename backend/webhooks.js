import shopify from "./shopify.js";

export const events = [];

const Webhooks = {
  async handleOrderCreated(req, res) {
    const event_type = req.headers["x-shopify-topic"];

    const event = {
      ...req.body,
      event_type,
    };

    events.push(event);

    res.status(200).send("Event received");
  },
};

export default Webhooks;
