using System.Collections.Concurrent;
using System.Collections.Generic;
namespace DroneGame
{
    public class BulletStore
    {
        private static BulletStore instance;
        private BulletStore() { }
        public static BulletStore GetInstance()
        {
            if (instance == null)
                instance = new BulletStore();
            return instance;
        }

        // Key: bulletId, Value: linked list of all BulletData points for this bullet
        private readonly ConcurrentDictionary<string, LinkedList<BulletData>> _bullets = new();

        // Adds a bullet and its precomputed trajectory points
        public void AddBullet(string bulletId, List<BulletData> calculatedPoints)
        {
            _bullets[bulletId] = new LinkedList<BulletData>(calculatedPoints);
        }

        public LinkedList<BulletData>? GetBulletPoints(string bulletId)
        {
            if (_bullets.TryGetValue(bulletId, out var list))
            {
                return new LinkedList<BulletData>(list);
            }
            return null;
        }

        public IEnumerable<KeyValuePair<string, LinkedList<BulletData>>> GetAllBullets()
        {
            foreach (var kvp in _bullets)
            {
                yield return kvp;
            }
        }

        public void RemoveBullet(string bulletId)
        {
            _bullets.TryRemove(bulletId, out _);
        }
    }
}
