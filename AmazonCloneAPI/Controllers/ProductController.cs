using AmazonCloneAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Azure;
using Azure.Storage.Blobs;
using Azure.Messaging.ServiceBus;

namespace AmazonCloneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase // https://amazoncloneapi.azurewebsites.net/api/product
    {
        private readonly CosmosClient _cosmosClient;
        private readonly CosmosClient _cosmosOrdersClient;
        private readonly BlobContainerClient _blobContainerClient;
        private readonly ServiceBusClient _azureServiceBusClient;

        private readonly string _databaseId;
        private readonly string _containerId;

        private readonly string _ordersDatabaseId;
        private readonly string _ordersContainerId;

        private readonly string _azureServiceBusEndpoint;
        private readonly string _ordersQueueName;

        public ProductController(IConfiguration configuration)
        {
            // CosmosDB GET object
            var cosmosDbSettings = configuration.GetSection("CosmosDbSettings");
            var endpoint = cosmosDbSettings["Endpoint"];
            var key = cosmosDbSettings["Key"];
            _databaseId = cosmosDbSettings["DatabaseId"];
            _containerId = cosmosDbSettings["ContainerId"];

            _cosmosClient = new CosmosClient(endpoint, key);

            // Azure Blob storage object
            var azureBlobStorageSettings = configuration.GetSection("AzureBlobStorage");
            var connStr = azureBlobStorageSettings["ConnectionString"];
            var blobContainer = azureBlobStorageSettings["ContainerName"];
            var _blobServiceClient = new BlobServiceClient(connStr);

            _blobContainerClient = _blobServiceClient.GetBlobContainerClient(blobContainer);

            // CosmosDB Orders object
            var cosmosOrdersDbSettings = configuration.GetSection("CosmosOrdersDbSettings");
            var ordersEndpoint = cosmosOrdersDbSettings["Endpoint"];
            var ordersKey = cosmosOrdersDbSettings["Key"];
            _ordersDatabaseId = cosmosOrdersDbSettings["DatabaseId"];
            _ordersContainerId = cosmosOrdersDbSettings["ContainerId"];
            _cosmosOrdersClient = new CosmosClient(ordersEndpoint, ordersKey);

            //Plain Secrets Retrieval (Azure Service Bus)
            var azureServiceBusSetting = configuration.GetSection("AzureServiceBus");
            _azureServiceBusEndpoint = azureServiceBusSetting["Endpoint"];
            _ordersQueueName = azureServiceBusSetting["OrdersQueueName"];

            _azureServiceBusClient = new ServiceBusClient(_azureServiceBusEndpoint);
        }

        [HttpGet("GetProduct")] // /getproduct?productId=prod1001
        public async Task<JsonResult> GetProduct(string productId)
        {
            try
            {
                var container = _cosmosClient.GetContainer(_databaseId, _containerId);
                var query = $"SELECT * FROM c WHERE c.id='{productId}'";
                var iterator = container.GetItemQueryIterator<Product>(query);

                if (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    return new JsonResult(response.ToList<Product>()[0]);
                }
                return new JsonResult("No query results found... Please troubleshoot API method: GetProduct()");
            }
            catch (Exception ex)
            {
                string error = $"500, Internal Server Error: {ex.Message}";
                return new JsonResult(error);
            }
        }

        [HttpGet("GetProductImage")] // /getproductimage?blobName=ipad.jpg
        public async Task<IActionResult> GetProductImage(string blobName)
        {
            try
            {
                var blobClient = _blobContainerClient.GetBlobClient(blobName);

                var response = await blobClient.DownloadAsync();

                using (var memoryStream = new MemoryStream())
                {
                    await response.Value.Content.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;

                    return File(memoryStream.ToArray(), response.Value.ContentType);
                }
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Error fetching blob: {ex.Message}");
                return NotFound();
            }
        }

        [HttpPost("PostNewOrder")]
        public async Task<JsonResult> PostNewOrder([FromBody] Orders data)
        {
            try
            {
                var container = _cosmosOrdersClient.GetContainer(
                    _ordersDatabaseId,
                    _ordersContainerId);

                var response = await container.CreateItemAsync(data);

                var sender = _azureServiceBusClient.CreateSender(_ordersQueueName);

                var message = new ServiceBusMessage(
                    BinaryData.FromObjectAsJson(data))
                {
                    ContentType = "application/json"
                };

                await sender.SendMessageAsync(message);
                await sender.DisposeAsync();

                return new JsonResult(response);
            }
            catch (Exception ex)
            {
                return new JsonResult(
                    $"500, Internal Server Error: {ex.Message}");
            }
        }

        [HttpGet("GetOrderById")] // /getorderbyid?id=pi_3OOsBwJ6RW9kbSMX0gnytxGo
        public async Task<JsonResult> GetOrderById(string id)
        {
            try
            {
                var container = _cosmosOrdersClient.GetContainer(_ordersDatabaseId, _ordersContainerId);
                var query = $"SELECT * FROM c WHERE c.id = '{id}'"; //SELECT * FROM c WHERE c.id = 'pi_3OOsBwJ6RW9kbSMX0gnytxGo'
                var iterator = container.GetItemQueryIterator<Orders>(query);

                if (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    return new JsonResult(response.ToList<Orders>()[0]);
                }
                return new JsonResult("No query results found... Please troubleshoot API method: GetProduct()");
            }
            catch (Exception ex)
            {
                string error = $"500, Internal Server Error: {ex.Message}";
                return new JsonResult(error);
            }
        }
    }
}
    