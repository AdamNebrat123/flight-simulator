using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using DroneGame;

public class BulletsMsgSender
{
	private static BulletsMsgSender instance;
	private BulletsMsgSender() { intervalMs = 1000 / fps; }
	public static BulletsMsgSender GetInstance()
	{
		if (instance == null)
			instance = new BulletsMsgSender();
		return instance;
	}

	private readonly int fps = 30;
	private readonly int intervalMs;
	private CancellationTokenSource? cts;

	public void Start()
	{
		cts = new CancellationTokenSource();
		Task.Run(() => SendLoop(cts.Token));
	}

	public void Stop()
	{
		cts?.Cancel();
	}

	private async Task SendLoop(CancellationToken token)
	{
		var bulletStore = BulletStore.GetInstance();
		while (!token.IsCancellationRequested)
		{
			try
			{
				var allBullets = new List<BulletData>();
				foreach (var kvp in bulletStore.GetAllBullets())
				{
					var bulletId = kvp.Key;
					var bulletPoints = kvp.Value;
					if (bulletPoints.Count > 0)
					{
						allBullets.Add(bulletPoints.First.Value); // Send the next (first) point
						bulletPoints.RemoveFirst(); // Remove the sent point
						if (bulletPoints.Count == 0)
						{
							bulletStore.RemoveBullet(bulletId); // Remove immediately if empty
						}
					}
				}
				if (allBullets.Count > 0)
				{
					var msg = new BulletsMsg { bullets = allBullets };
					string json = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.BulletsMsg, msg, ModeEnum.DroneGame);
					await UIWebSocketServer.SendMsgToClients(json, ModeEnum.DroneGame);
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine("Error in BulletsMsgSender: " + ex.Message);
			}

			await Task.Delay(intervalMs, token);
		}
	}
}
