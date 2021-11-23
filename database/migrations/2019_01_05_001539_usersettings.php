<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
class Usersettings extends Migration
{
     public function up()
     {
         Schema::create('user_settings', function (Blueprint $table) {
             $table->increments('id');
             $table->string('lang')->default('');
             $table->string('theme')->default('');
             $table->boolean('autoplay')->default(false);
             $table->integer('user_id')->references('id')->on('users');
             $table->timestamps();
         });
     }
     public function down()
     {
         Schema::dropIfExists('user_settings');
     }
}
