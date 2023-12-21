using Newtonsoft.Json;

namespace AmazonCloneAPI.Models
{
    public class OrderItem
    {
        [JsonProperty("prodId")]
        public string ProdId { get; set; }

        [JsonProperty("price")]
        public float Price { get; set; }
    }
}
