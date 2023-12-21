using Newtonsoft.Json;

namespace AmazonCloneAPI.Models
{
    public class Orders
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("user")]
        public string User { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("shippingAddress")]
        public string ShippingAddress { get; set; }
        
        [JsonProperty("shippingState")]
        public string ShippingState { get; set; }
        
        [JsonProperty("items")]
        public OrderItem[] Items { get; set; }
        
        [JsonProperty("created")]
        public long Created { get; set; }
        
        [JsonProperty("amount")]
        public float Amount { get; set; }
    }
}