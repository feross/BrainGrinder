/* Author: Feross Aboukhadijeh

*/

soundManager.url = '/swf/';
soundManager.flashVersion = 8; // optional: shiny features (default = 8)
//soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
// enable HTML5 audio support, if you're feeling adventurous. iPad/iPhone will always get this.
//soundManager.useHTML5Audio = true;
var soundManagerLoaded = false;
soundManager.onload = function() {
    soundManagerLoaded = true;
};

var deck,
    defaultData = {
    from: 'English',
    fromCode: 'en',
    to: 'Spanish',
    toCode: 'es',
    cards: [["apple","manzana"],["orange","naranja"],["cherry","cereza"],["pear","pera"],["apricot","albaricoque"],["peach","melocotón"],["plum","ciruela"],["raspberry","frambuesa"],["strawberry","fresa"],["honeysuckle","madreselva"],["mulberry","morera"],["date","fecha"],["fig","fig"],["grape","de uva"],["pomegranate","granada"],["grapefruit","pomelo"],["lemon","limón"],["lime","cal"],["mandarin","mandarina"],["tangerine","mandarina"],["avocado","aguacate"],["peanut","maní"],["almond","almendra"],["coconut","de coco"],["chili","chile"],["pepper","pimienta"],["guava","guayaba"],["honeydew","mielada"],["olive","de oliva"],["pecan","pacana"],["vanilla","vainilla"],["kiwi","kiwi"],["blueberry","arándano"]]
};

$(function() {
    deck = new Deck();
    deck.setup();

    setup();
});

var Deck = function(data) {
    this.displayHelp = false;
    if (!data || !data.cards.length) {
        data = defaultData;
        this.displayHelp = true;
    }
    this.data = data;
    this.i; // current index in the deck
    this.isFrontSideUp = true;
    this.cardTransiton = 250;

    this.setup = function() {
        this.i = 0;
        $('#main').empty();
        var card = this.loadCard(0)
            .appendTo('#main')
            .hide()
            .fadeIn();
        deck.sayCurrentCard();
        $('#footer').text((this.i+1)+' of '+this.data.cards.length);
    };

    this.loadCard = function(i) {
        var card = $('#flashcardTemplate')
            .tmpl({
                data: this.data,
                i: i,
                help: this.displayHelp
            });
        return card;
    };

    this.next = function() {
        if (this.i >= this.data.cards.length - 1) {
            return;
        }

        var cardOffset = ($(window).width() / 2) + 150;
        $('.flashcardWrapper')
            .animate({left: -cardOffset}, this.cardTransiton, function() {
                $(this).remove();
            });

        var card = this.loadCard(++this.i)
            .appendTo('#main')
            .css({
                left: cardOffset
            })
            .animate({left: 0}, this.cardTransiton);

        $('#footer').text((this.i+1)+' of '+this.data.cards.length);

        this.isFrontSideUp = true;
        deck.sayCurrentCard();
    };

    this.prev = function() {
        if (this.i <= 0) {
            return;
        }

        var cardOffset = ($(window).width() / 2) + 150;
        $('.flashcardWrapper')
            .animate({left: cardOffset}, this.cardTransiton, function() {
                $(this).remove();
            });

        var card = this.loadCard(--this.i)
            .appendTo('#main')
            .css({
                left: -cardOffset
            })
            .animate({left: 0}, this.cardTransiton);

        $('#footer').text((this.i+1)+' of '+this.data.cards.length);

        this.isFrontSideUp = true;
        deck.sayCurrentCard();
    };

    this.flipCard = function() {
        this.isFrontSideUp = !this.isFrontSideUp;
        deck.sayCurrentCard();
        if (Modernizr.csstransforms) {
            $('.flashcard').toggleClass('flip');
        } else {
            $('.flashcard').quickFlipper();
        }
    };

    this.sayCurrentCard = function() {
        if (!soundManagerLoaded) {
            return;
        }
        var side = this.isFrontSideUp ? 0 : 1;
        var lang = this.isFrontSideUp ? this.data.fromCode : this.data.toCode;
        var word = this.data.cards[this.i][side];

        if (!word) {
            return;
        }

        var hash = hex_sha1(word+'####'+lang);
        var soundObj = soundManager.createSound({
            id: hash,
            url:'/tts/'+hash+'.mp3?q='+encodeURIComponent(word)+'&tl='+encodeURIComponent(lang)
        });
        soundObj.play({
            onfinish:function() {
                // once sound has loaded and played, unload and destroy it.
                this.destruct(); // will also try to unload before destroying.
            }
        });
    };
};

function setup() {
    $('.flashcard')
        .live('click', function() {
             deck.flipCard();
         });

	$('#newDeckLink').bind('click', function(e) {
	    e.preventDefault();
	    $(this).hide();
	    $('#main, #footer').empty();
	    $('#keys').hide();
	    $('.callout-new').remove();

        if (!$('#newDeckForm textarea').text()) {
            $('#newDeckForm textarea').text('teachers\nleave\nthem\nkids\nalone');
        }
        $('#newDeckForm')
            .fadeIn(400, function() {
                $('#newDeckForm textarea').focus();
            });
	});

	$('#newDeckForm input[type="submit"]').live('click', function(e) {
	    e.preventDefault();

	    var words = $('#newDeckForm textarea').val(),
	        fromSelect = $('#newDeckForm select[name="from"]'),
	        toSelect = $('#newDeckForm select[name="to"]'),
	        from = fromSelect.find('option:selected').text(),
	        fromCode = fromSelect.val(),
	        to = toSelect.find('option:selected').text(),
	        toCode = toSelect.val(),
	        cards = [],
	        ajaxReqs = [];
	    words = words.split('\n');
	    $.each(words, function(i, v) {
	        var d = $.ajax({
	           dataType: 'jsonp',
	           url: 'https://www.googleapis.com/language/translate/v2?key=AIzaSyCXZPVIG5OpDxBP_v9aJvj3bx2q-9Vo-zE&source='+encodeURIComponent(fromCode)+'&target='+encodeURIComponent(toCode)+'&q='+encodeURIComponent(v),
	           success: function(trans) {
	               var translatedWord;
	               if (trans && trans.data && trans.data.translations && trans.data.translations[0] && trans.data.translations[0].translatedText) {
	                  translatedWord = trans.data.translations[0].translatedText;
	               } else {
	                  translatedWord = null;
	               }
	               cards[i] = [v, translatedWord];
	           }
	        });
	        ajaxReqs.push(d);
	    });
        $.when.apply(undefined, ajaxReqs)
            .done(function() {
                deck = new Deck({
                    from: from,
                    fromCode: fromCode,
                    to: to,
                    toCode: toCode,
                    cards: cards
                });
                deck.setup();

                $('#newDeckLink').show();
        	    $('#keys').show();
        	    $('#newDeckForm').hide();
            })
            .fail(function() {
                alert('One or more words failed to translate.');
            });

	});

	// Setup keyboard control
	$(document)
	    .bind('keydown', 'space', function (e) {
            deck.flipCard();
	        e.preventDefault();
	    })
        .bind('keydown', 'left', function(e) {
            deck.prev();
            e.preventDefault();
        })
        .bind('keydown', 'right', function(e) {
            deck.next();
            e.preventDefault();
        });
    $('#keys .leftArr').click(function(e) {
        deck.prev();
        e.preventDefault();
    });
    $('#keys .rightArr').click(function(e) {
        deck.next();
        e.preventDefault();
    });
    $('#keys .space').click(function(e) {
        deck.flipCard();
        e.preventDefault();
    });

    // Swipe for iPad
    $('body').touchwipe({
        wipeLeft: function() {
            deck.next();
        },
        wipeRight: function() {
            deck.prev();
        }
    });
}


