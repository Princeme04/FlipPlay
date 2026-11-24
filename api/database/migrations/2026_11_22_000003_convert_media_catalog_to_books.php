<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The old locally seeded film catalog is intentionally removed.
        DB::table('media')->delete();

        Schema::table('media', function (Blueprint $table) {
            $table->string('type', 20)->change();
            $table->string('format', 30)->nullable()->after('type');
            $table->string('creator', 150)->nullable()->after('genre');
            $table->renameColumn('poster_url', 'cover_url');
        });
    }

    public function down(): void
    {
        DB::table('media')->delete();

        Schema::table('media', function (Blueprint $table) {
            $table->renameColumn('cover_url', 'poster_url');
            $table->dropColumn(['format', 'creator']);
            $table->enum('type', ['movie', 'series', 'anime'])->change();
        });
    }
};
