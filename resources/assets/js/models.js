var User =  (function () {
    function User(id, name, avatar, background, bio, mediaIds, tagString, publicState) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.background = background;
        this.bio = bio;
        this.mediaIds = mediaIds;
        this.tagString = tagString;
        this.publicState = publicState;
    }
    User.prototype.toJson = function () {
        return "{id:" + this.id + ",name:'" + this.name + "',avatar:'" + this.avatar + "',background:'" + this.background + "'}";
    };
    return User;
}());
export { User };
var Media =  (function () {
    function Media(id, title, description, source, poster_source, duration, simpleType, techType, type, user, user_id, created_at, updated_at, created_at_readable, comments, tags, myLike, likes, dislikes, tracks, category_id) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.source = source;
        this.poster_source = poster_source;
        this.duration = duration;
        this.type = type;
        this.simpleType = simpleType;
        this.techType = techType;
        this.user = user;
        this.user_id = user_id;
        this.comments = comments;
        this.tags = tags;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.created_at_readable = created_at_readable;
        this.myLike = myLike;
        this.likes = likes;
        this.dislikes = dislikes;
        this.tagString = this.tagStringing();
        this.tracks = tracks;
        this.category_id = category_id;
    }
    Media.prototype.tagStringing = function () {
        var theTagString = "";
        $.each(this.tags, function (key, val) {
            theTagString += val.name + " ";
        });
        return theTagString;
    };
    Media.prototype.toJson = function () {
        return "{title:'" + this.title + "',description:'" + this.description + "',source:'" + this.source;
    };
    return Media;
}());
export { Media };
var Tag =  (function () {
    function Tag(id, name, slug, count) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.count = count;
    }
    return Tag;
}());
export { Tag };
var Category =  (function () {
    function Category(id, title, description, avatar, background) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.avatar = avatar;
        this.background = background;
    }
    return Category;
}());
export { Category };
