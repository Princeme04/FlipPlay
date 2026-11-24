# FlipPlay REST API (Laravel 12)

## XAMPP setup

1. Start **MySQL** in the XAMPP Control Panel (Apache is optional when using Artisan).
2. In phpMyAdmin, create a database named `flipplay` using `utf8mb4_unicode_ci`.
3. Copy `.env.example` to `.env` if needed and set `DB_CONNECTION=mysql`, host `127.0.0.1`, port `3306`, database `flipplay`, and your MySQL username/password. XAMPP commonly uses `root` with an empty password by default.
4. From this `api` directory run:

   ```powershell
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan route:list --path=api
   php artisan serve
   ```

The API base URL is `http://127.0.0.1:8000/api`. Start it with `php artisan serve --host=127.0.0.1 --port=8000`; run the frontend separately with `npx serve -l 4173 .` from the project `src` folder. The frontend reads the FlipPlay API at port 8000, so both servers must be running. For Apache, point the virtual host document root at `api/public` and enable rewrite rules.

## Reading catalog and cover uploads

The migration removes the old local movie rows and changes the Media model to books. It adds book formats (novel and manga), creator/author, and cover URL fields. Seed the sample book catalog and demo user with:

```powershell
php artisan migrate --seed
php artisan storage:link
```

An existing storage link is fine. The demo account is `demo@flipplay.test` / `password`. Media POST/PATCH accepts `type: book`, an optional `format` of `novel` or `manga`, `creator`, and a multipart cover image field named `cover` (JPEG, PNG, or WebP, up to 5 MB). Laravel stores uploads on the public disk and returns a `cover_url`. Sample covers are downloaded from [Open Library's Covers API](https://openlibrary.org/dev/docs/api/covers).

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/media` | Paginated media list |
| GET | `/api/media?search=atomic` | Search media by part of its title |
| POST | `/api/media` | Create media |
| GET | `/api/media/{media}` | Show media and its users |
| PUT/PATCH | `/api/media/{media}` | Update media |
| DELETE | `/api/media/{media}` | Delete media |
| GET | `/api/users` | List users with collections |
| POST | `/api/users` | Create a user |
| GET | `/api/users/{user}` | Show a user and collection |
| GET | `/api/users/{user}/collection` | List only that user's collected media |
| POST | `/api/users/{user}/collection/{media}` | Add media to a user's collection |
| DELETE | `/api/users/{user}/collection/{media}` | Remove media from a user's collection |

Media JSON input requires a unique `title` and `type: book`. Optional fields are `format` (`novel` or `manga`), `creator`, `genre`, `release_year`, `description`, and `cover_url`. Validation errors return Laravel's standard JSON 422 response when sent with `Accept: application/json`.

### Demo flow

Send `Accept: application/json` on requests. Create a book with `POST /api/media`:

```json
{
  "title": "Example Book",
  "type": "book",
  "format": "novel",
  "creator": "Example Author",
  "genre": "Fantasy",
  "release_year": 2025,
  "cover_url": "https://example.com/cover.jpg"
}
```

Then try `GET /api/media`, `GET /api/media?search=example`, and `GET /api/media/{id}`. The detail response includes `users`, the users who added the book to their collections. Add a book with `POST /api/users/{userId}/collection/{mediaId}`, view that user's books with `GET /api/users/{userId}/collection` (or `GET /api/users/{userId}`), and remove one with `DELETE /api/users/{userId}/collection/{mediaId}`. The seeded demo user is `demo@flipplay.test`.

The seeded demo user's ID is visible at `GET /api/users`; use it in the collection URLs above.

Create a user with `POST /api/users` and JSON containing `name`, `email`, `password`, and `password_confirmation`. Do not send `id` or `media_collection`; the database creates the ID and collections are added through the collection endpoints.
