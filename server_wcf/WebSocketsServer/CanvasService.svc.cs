using System.Collections.Generic;
using System.Threading;
using System.Web.Script.Serialization;
using Microsoft.ServiceModel.WebSockets;

namespace WebSocketsServer
{
    internal enum MessageType
    {
        Join,
        UpdateClients,
        Draw
    }

    internal class Message
    {
        public MessageType Type { get; set; }
        public string UserName { get; set; }
        public object Value { get; set; }
    }

    //{x: e.clientX, y: e.clientY, color: selfColor, action: "move" }
    internal class Data
    {
        public int x { get; set; }
        public int y { get; set; }
        public string color { get; set; }
        public string action { get; set; }
    }

    public class CanvasService : WebSocketService
    {
        private static readonly WebSocketCollection<CanvasService> clients = new WebSocketCollection<CanvasService>();

        private static int count;
        private readonly List<string> lista = new List<string>();

        private bool faulted;
        private string name;

        public override void OnOpen()
        {
            //JavaScriptSerializer serializer = new JavaScriptSerializer();

            //base.Send(serializer.Serialize("Connected!"));
            //while (true)
            //{
            //    base.Send(serializer.Serialize("Time now is: " + DateTime.Now));
            //    System.Threading.Thread.Sleep(1000);
            //}
            clients.Add(this);
            name = string.Format("Client {0}", Interlocked.Increment(ref count));

            //clients.Broadcast(string.Format("{0} joined.", name));
        }

        protected override void OnClose()
        {
            if (!faulted)
            {
                clients.Remove(this);
                clients.Broadcast(string.Format("{0} left.", name));
            }
        }

        protected override void OnError()
        {
            faulted = true;
            clients.Remove(this);
            //clients.Broadcast(string.Format("{0} left (error).", name));
        }

        public override void OnMessage(string message)
        {
            var ser = new JavaScriptSerializer();

            var msg = ser.Deserialize<Message>(message);
            switch (msg.Type)
            {
                case MessageType.Join:
                    name = msg.Value.ToString();
                    lista.Add(name);
                    string response = ser.Serialize(new
                                                        {
                                                            type = MessageType.UpdateClients,
                                                            value = lista.ToArray()
                                                        });

                   // Send(response);
                    clients.Broadcast(response);

                    break;
                case MessageType.Draw:
                    //var data = ser.Deserialize<Data>((Data)msg.Value);
                    string responsedata = ser.Serialize(new
                    {
                        type = MessageType.Draw,
                        username = this.name,
                        value = msg.Value
                    });
                    clients.Broadcast(responsedata);
                    break;
                default:
                    return;
            }
        }
    }
}

