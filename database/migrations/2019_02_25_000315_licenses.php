<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
class Licenses extends Migration
{
    public function up()
    {
        Schema::create('licenses', function (Blueprint $table) {
          $table->increments('id');
          $table->string('title');
          $table->text('short_description')->nullable();
          $table->text('description')->nullable();
          $table->timestamps();
        });
    }
    public function down()
    {
        Schema::dropIfExists('licenses');
    }
}
