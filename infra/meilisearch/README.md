# Meilisearch Configuration

Optional Docker setup for local Meilisearch testing.

## Development

```bash
docker-compose up -d
```

Meilisearch runs on `http://localhost:7700`

API Key: `dev-key-12345` (development only)

## Production

For production, use managed Meilisearch or self-hosted with proper security:
- Set strong MEILI_MASTER_KEY
- Enable HTTPS
- Restrict network access
- Use separate read/write keys

## Integration

Frontend calls Meilisearch API directly for influencer search:

```typescript
const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_URL,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_KEY,
});
```
