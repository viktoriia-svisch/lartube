<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
class CreateMediasTable extends Migration
{
    public function up()
    {
        Schema::create('media', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title')->unique();
            $table->text('source');
            $table->text('description')->nullable();
            $table->integer('users_id')->references('id')->on('users');
            $table->integer('category_id')->nullable()->references('id')->on('categories');
            $table->integer('views')->default(0);
            $table->timestamps();
        });
    }
    public function down()
    {
        Schema::dropIfExists('videos');
    }
}
