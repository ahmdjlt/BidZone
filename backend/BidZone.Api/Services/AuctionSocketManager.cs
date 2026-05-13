using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text.Json;
using BidZone.Domains.DTOs;

namespace BidZone.Api.Services;

public sealed class AuctionSocketManager
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly ConcurrentDictionary<int, ConcurrentDictionary<Guid, WebSocket>> _auctionSockets = new();

    public async Task HandleConnectionAsync(int auctionId, WebSocket socket, CancellationToken cancellationToken)
    {
        var connectionId = Guid.NewGuid();
        var auctionConnections = _auctionSockets.GetOrAdd(auctionId, _ => new ConcurrentDictionary<Guid, WebSocket>());
        auctionConnections[connectionId] = socket;

        var buffer = new byte[1024 * 4];

        try
        {
            while (!cancellationToken.IsCancellationRequested && socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(buffer, cancellationToken);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    break;
                }
            }
        }
        finally
        {
            auctionConnections.TryRemove(connectionId, out _);
            if (auctionConnections.IsEmpty)
            {
                _auctionSockets.TryRemove(auctionId, out _);
            }

            if (socket.State is WebSocketState.Open or WebSocketState.CloseReceived)
            {
                await socket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Connection closed",
                    CancellationToken.None);
            }
        }
    }

    public async Task BroadcastBidAsync(BidDto bid, CancellationToken cancellationToken)
    {
        if (!_auctionSockets.TryGetValue(bid.AuctionId, out var auctionConnections))
        {
            return;
        }

        var payload = JsonSerializer.SerializeToUtf8Bytes(
            new AuctionSocketMessage("new-bid", bid),
            JsonOptions);

        foreach (var (connectionId, socket) in auctionConnections.ToArray())
        {
            if (socket.State != WebSocketState.Open)
            {
                auctionConnections.TryRemove(connectionId, out _);
                continue;
            }

            try
            {
                await socket.SendAsync(
                    payload,
                    WebSocketMessageType.Text,
                    endOfMessage: true,
                    cancellationToken);
            }
            catch (WebSocketException)
            {
                auctionConnections.TryRemove(connectionId, out _);
            }
        }
    }

    private sealed record AuctionSocketMessage(string Type, BidDto Bid);
}
