
exports.getShowInfoMany = function (posts, cutSentence) {
    for(var idx in posts)
    {
        this.getShowInfo(posts[idx], cutSentence);
    }
};

exports.getShowInfo = function (post, cutSentence) {
    post.showContent    = ( post.headline_content ) ? post.headline_content : post.content;
    post.showTitle      = ( post.headline_title ) ? post.headline_title : post.title;
    post.showImage      = ( post.headline_img_path ) ? post.headline_img_path : post.main_img_path;

    if ( cutSentence ) {
         post.cuttedContent = this.findSentenceEnd( post.showContent, cutSentence )
    }
};

exports.findSentenceEnd = function (sentence, end) {
    if (end == undefined) { end = 220; }

    var sentenceCopy = sentence;
    sentenceCopy = sentenceCopy.replace(/(<([^>]+)>)/ig,"").slice(0,end);

    //If the string is less than "end" var, return without managing.
    if ( !sentenceCopy[end-1] ) { return sentenceCopy; }

    if (sentenceCopy[end-1] != ' ') {
        return this.findSentenceEnd(sentence, (end+1) );
    }else{
        return sentenceCopy.slice(0, (end-1) );
    }

};