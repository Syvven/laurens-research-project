/* Period parameters */  
var N = 624;
var M = 397;
var MATRIX_A = 0x9908b0df;   /* constant vector a */
var UPPER_MASK = 0x80000000; /* most significant w-r bits */
var LOWER_MASK = 0x7fffffff; /* least significant r bits */

var mt = new Array(N); /* the array for the state vector */
var mti=N+1; /* mti==N+1 means mt[N] is not initialized */

/* initializes mt[N] with a seed */
function init_genrand(s)
{
    mt[0]= s >>> 0;
    for (mti=1; mti<N; mti++) {
        var s = mt[mti-1] ^ (mt[mti-1] >>> 30);
	    mt[mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
			+ mti;
        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
        /* In the previous versions, MSBs of the seed affect   */
        /* only MSBs of the array mt[].                        */
        /* 2002/01/09 modified by Makoto Matsumoto             */
        mt[mti] >>>= 0;
        /* for >32 bit machines */
    }
}

/* initialize by an array with array-length */
/* init_key is the array for initializing keys */
/* key_length is its length */
/* slight change for C++, 2004/2/26 */
function init_by_array(init_key, key_length)
{
    var i, j, k;
    init_genrand(19650218);
    i=1; j=0;
    k = (N>key_length ? N : key_length);
    for (; k; k--) {
        var s = mt[i-1] ^ (mt[i-1] >>> 30)
        mt[i] = (mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525)))
          + init_key[j] + j; /* non linear */
        mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
        i++; j++;
        if (i>=N) { mt[0] = mt[N-1]; i=1; }
        if (j>=key_length) j=0;
    }
    for (k=N-1; k; k--) {
        var s = mt[i-1] ^ (mt[i-1] >>> 30);
        mt[i] = (mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941))
          - i; /* non linear */
        mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
        i++;
        if (i>=N) { mt[0] = mt[N-1]; i=1; }
    }

    mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */ 
}

/* generates a random number on [0,0xffffffff]-interval */
function genrand_int32()
{
    var y;
    var mag01 = new Array(0x0, MATRIX_A);
    /* mag01[x] = x * MATRIX_A  for x=0,1 */

    if (mti >= N) { /* generate N words at one time */
        var kk;

        if (mti == N+1)   /* if init_genrand() has not been called, */
            init_genrand(5489); /* a default initial seed is used */

        for (kk=0;kk<N-M;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+M] ^ (y >>> 1) ^ mag01[y & 0x1];
        }
        for (;kk<N-1;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+(M-N)] ^ (y >>> 1) ^ mag01[y & 0x1];
        }
        y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
        mt[N-1] = mt[M-1] ^ (y >>> 1) ^ mag01[y & 0x1];

        mti = 0;
    }
  
    y = mt[mti++];

    /* Tempering */
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);

    return y >>> 0;
}

/* generates a random number on [0,0x7fffffff]-interval */
function genrand_int31()
{
    return (genrand_int32()>>>1);
}

/* generates a random number on [0,1]-real-interval */
function genrand_real1()
{
    return genrand_int32()*(1.0/4294967295.0); 
    /* divided by 2^32-1 */ 
}

/* generates a random number on [0,1)-real-interval */
function genrand_real2()
{
    return genrand_int32()*(1.0/4294967296.0); 
    /* divided by 2^32 */
}

/* generates a random number on (0,1)-real-interval */
function genrand_real3()
{
    return (genrand_int32() + 0.5)*(1.0/4294967296.0); 
    /* divided by 2^32 */
}

/* generates a random number on [0,1) with 53-bit resolution*/
function genrand_res53()
{ 
    var a=genrand_int32()>>>5, b=genrand_int32()>>>6; 
    return(a*67108864.0+b)*(1.0/9007199254740992.0); 
} 
/* These real versions are due to Isaku Wada, 2002/01/09 added */

init_genrand(1984);

function arbitrary_int_inclusive(min, max)
{
    return (genrand_int31() % (max-min+1)) + min;
}
function arbitrary_int(min, max)
{
    return (genrand_int31() % (max-min)) + min;
}

var intro_ui = document.getElementById("intro-ui");

var canvas, ctx;
var width, height;
var grid_width, grid_height;
var squares = [];
var gapsize = 0;
var squaresize = 0;

var countdown_timer = 2;
var break_count = 1;

var started = false;
var start = false;
var draw = false;
var redraw = false;
var dont_click_again = true;
var done = false;
var name_entered = false;

var prev, now;

var blue_text = [];
blue_text.length = 48;
var counter = 0

// Round indices
var initred = {
    r: 202,
    g: 51,
    b: 51
};

var initblue = {
    r: 51,
    g: 102,
    b: 153
};

var initgreen = {
    r: 102,
    g: 204,
    b: 51
}

blue_text[counter++] = {
    color: initred,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    gap: true
}
blue_text[counter++] = {
    color: initred,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    gap: true
}
for (let i = 1; i < 8; i++)
{
    blue_text[counter++] = {
        color: initred,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 10*i,
            b: 0
        },
        gap: true
    }
}
for (let i = 1; i < 8; i++)
{
    blue_text[counter++] = {
        color: initred,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 0,
            b: 10*i
        },
        gap: true
    }
}
blue_text[counter++] = {
    color: initgreen,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    gap: true
}
blue_text[counter++] = {
    color: initgreen,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    gap: true
}
for (let i = 1; i < 8; i++)
{
    blue_text[counter++] = {
        color: initgreen,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 10*i,
            g: 0,
            b: 0
        },
        gap: true
    }
}
for (let i = 1; i < 8; i++)
{
    blue_text[counter++] = {
        color: initgreen,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 0,
            b: 10*i
        },
        gap: true
    }
}
blue_text[counter++] = {
    color: initblue,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    gap: true
}
blue_text[counter++] = {
    color: initblue,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    gap: true
}
for (let i = 1; i < 8; i++)
{
    blue_text[counter++] = {
        color: initblue,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 10*i,
            g: 0,
            b: 0
        },
        gap: true
    }
}
for (let i = 1; i < 8; i++)
{
    blue_text[counter++] = {
        color: initblue,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 10*i,
            b: 0
        },
        gap: true
    }
}


var red_text = [];
red_text.length = 12;
counter = 0;
for (let i = 1; i < 3; i++)
{
    red_text[counter++] = {
        color: initred,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 10*i,
            b: 0
        },
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    red_text[counter++] = {
        color: initred,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 0,
            b: 10*i
        },
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    red_text[counter++] = {
        color: initgreen,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 10*i,
            g: 0,
            b: 0
        },
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    red_text[counter++] = {
        color: initgreen,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 0,
            b: 10*i
        },
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    red_text[counter++] = {
        color: initblue,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 10*i,
            g: 0,
            b: 0
        },
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    red_text[counter++] = {
        color: initblue,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 10*i,
            b: 0
        },
        gap: false
    };
}

var green_text = [];
green_text.length = 24;
counter = 0;
green_text[counter++] = {
    color: initred,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    rand_change: 2,
    gap: true
};
green_text[counter++] = {
    color: initred,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    rand_change: 3,
    gap: true
};
for (let i = 1; i < 4; i++)
{
    green_text[counter++] = {
        color: initred,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 10 + 20*i,
            b: 0
        },
        rand_change: 3,
        gap: true
    };
}
for (let i = 1; i < 4; i++)
{
    green_text[counter++] = {
        color: initred,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 0,
            b: 10 + 20*i
        },
        rand_change: 2,
        gap: true
    };
}
green_text[counter++] = {
    color: initgreen,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    rand_change: 1,
    gap: true
};
green_text[counter++] = {
    color: initgreen,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    rand_change: 3,
    gap: true
};
for (let i = 1; i < 4; i++)
{
    green_text[counter++] = {
        color: initgreen,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 10 + 20*i,
            g: 0,
            b: 0
        },
        rand_change: 3,
        gap: true
    };
}
for (let i = 1; i < 4; i++)
{
    green_text[counter++] = {
        color: initgreen,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 0,
            b: 10 + 20*i
        },
        rand_change: 1,
        gap: true
    };
}
green_text[counter++] = {
    color: initblue,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    rand_change: 1,
    gap: true
};
green_text[counter++] = {
    color: initblue,
    target_index: 16,
    target_change: {
        r: 0,
        g: 0,
        b: 0
    },
    rand_change: 2,
    gap: true
};
for (let i = 1; i < 4; i++)
{
    green_text[counter++] = {
        color: initblue,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 10 + 20*i,
            g: 0,
            b: 0
        },
        rand_change: 2,
        gap: true
    };
}
for (let i = 1; i < 4; i++)
{
    green_text[counter++] = {
        color: initblue,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 10 + 20*i,
            b: 0
        },
        rand_change: 1,
        gap: true
    };
}

var yellow_text = [];
yellow_text.length = 12;
counter = 0;
for (let i = 1; i < 3; i++)
{
    yellow_text[counter++] = {
        color: initred,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 10 + 20*i,
            b: 0
        },
        rand_change: 3,
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    yellow_text[counter++] = {
        color: initred,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 0,
            b: 10 + 20*i
        },
        rand_change: 2,
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    yellow_text[counter++] = {
        color: initgreen,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 10 + 20*i,
            g: 0,
            b: 0
        },
        rand_change: 3,
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    yellow_text[counter++] = {
        color: initgreen,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 0,
            b: 10 + 20*i
        },
        rand_change: 1,
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    yellow_text[counter++] = {
        color: initblue,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 10 + 20*i,
            g: 0,
            b: 0
        },
        rand_change: 2,
        gap: false
    };
}
for (let i = 1; i < 3; i++)
{
    yellow_text[counter++] = {
        color: initblue,
        target_index: arbitrary_int_inclusive(0, 15),
        target_change: {
            r: 0,
            g: 10 + 20*i,
            b: 0
        },
        rand_change: 1,
        gap: false
    };
}


/* 0 to 47 */
var blue_text_indices = [
    32, 24, 21, 26, 6, 34, 12, 2, 40, 39, 13, 45, 47, 46, 44, 33, 22, 20, 1, 23, 9, 37, 35, 38, 5, 17, 4, 28, 8, 11, 29, 31, 36, 19, 43, 7, 16, 14, 18, 30, 10, 15, 41, 3, 0, 27, 25, 42
];

/* 0 to 11 */
var red_text_indices = [
    2, 5, 3, 11, 4, 1, 8, 6, 0, 7, 9, 10
];

/* 0 to 23 */
var green_text_indices = [
    6, 20, 23, 3, 18, 7, 14, 8, 17, 21, 10, 0, 5, 13, 4, 15, 11, 1, 16, 22, 12, 19, 9, 2
];

/* 0 to 11 */
var yellow_text_indices = [
    11, 4, 9, 8, 5, 3, 10, 7, 6, 0, 1, 2
];

var round_map = [
    32, 24, 21, 26, 6, 34, 12, 2, 40, 39, 13, 45, 47, 46, 44, 33, 22, 20,
    1, 23, 9, 37, 35, 38, 5, 17, 4, 28, 8, 11, 29, 31, 36, 19, 43, 7, 16, 
    14, 18, 30, 10, 15, 41, 3, 0, 27, 25, 42,

    2+48, 5+48, 3+48, 11+48, 4+48, 1+48, 8+48, 6+48, 0+48, 7+48, 9+48, 10+48,

    6+60, 20+60, 23+60, 3+60, 18+60, 7+60, 14+60, 8+60, 17+60, 21+60, 10+60, 0+60, 
    5+60, 13+60, 4+60, 15+60, 11+60, 1+60, 16+60, 22+60, 12+60, 19+60, 9+60, 2+60,

    11+84, 4+84, 9+84, 8+84, 5+84, 3+84, 10+84, 7+84, 6+84, 0+84, 1+84, 2+84
]

var actual_map = []
for (let i = 0; i < round_map.length; i++)
{
    for (let j = 0; j < round_map.length; j++)
    {
        if (round_map[j] == i)
        {
            actual_map.push(j)
            break;
        }
    }
}

var rounds = [];
var results = [];

var current_round = 0;

/* will be 96 total */
// var num_rounds = 84;
var num_rounds = 96;

class Square
{
    constructor(color, tl, br)
    {
        this.color = color;
        this.tl = tl;
        this.br = br;
        this.target = false;
    }

    contains(x, y)
    {
        return (
            x > this.tl.x && x < this.br.x 
            && y > this.tl.y && y < this.br.y
        );
    }
}


function slight_break()
{
    start = false;
    var y = setInterval((e) =>
    {
        if (break_count == 0)
        {
            break_count = 1;
            draw = true;
            clearInterval(y);
        }
        else 
        {
            break_count--;
        }
    }, 300);
}

function construct_params(data)
{
    let ret = {
        entry: {
            1738755584: data
        }
    }
    
    var searchParams = 'entry.' + new URLSearchParams(ret.entry).toString();
    
    return searchParams;
}

function on_finish(name)
{
    var str = name;
    for (let i = 0; i < num_rounds; i++)
    {
        var e = results[actual_map[i]];
        var r = rounds[actual_map[i]];

        str += "," + r.target_index + "," + e.time + "," + e.hit_target;
    }

    console.log(str);

    var searchParams = construct_params(str);

    fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSewEByiBTVUWJoH6Xf9LGY4Zuwy4sLdtPrA5EmidiSjz0S1oQ/formResponse", {
        method: "POST",
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: searchParams
    });
}

function animate(timestamp) 
{
    if (current_round == rounds.length)
    {
        done = true;
        canvas.style.display = "none";
        document.getElementById("end").style.display = "inline-block";
        console.log(results);

        return;
    }
    
    if (start)
    {
        ctx.clearRect(
            0,0,
            width, height
        );
        slight_break();

        set_values();
    }

    if (draw || redraw)
    {
        ctx.clearRect(
            0,0,
            width, height
        );

        ctx.lineWidth = 0;
        for (let i = 0; i < 16; i++)
        {
            var e = squares[i]

            ctx.fillStyle = `rgb(
                ${e.color.r},
                ${e.color.g},
                ${e.color.b}
            )`;

            var no_wid = e.br.x - e.tl.x;
            var no_het = e.br.y - e.tl.y;
            ctx.fillRect(
                e.tl.x,
                e.tl.y,
                no_wid,
                no_het
            );
        }

        var e = squares[16];
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.fillStyle = `rgb(0,0,0)`;
        
        var no_wid = e.br.x - e.tl.x;
        var no_het = e.br.y - e.tl.y;
        ctx.strokeRect(
            e.tl.x,
            e.tl.y,
            no_wid,
            no_het
        );
        
        ctx.font = "bold 5vmin Times New Roman"
        ctx.textAlign = 'center';
        ctx.fillText(
            "No Outlier",
            e.tl.x + no_wid*0.5,
            e.tl.y + no_het*0.75
        );

        ctx.fillText(
            "Round: " + (current_round+1) + "/" + num_rounds,
            squares[0].tl.x + (squares[3].br.x - squares[0].tl.x) * 0.5,
            squares[0].tl.y - no_het
        );

        draw = false;
        redraw = false;
        dont_click_again = false;
        prev = new Date();
    }
    
    requestAnimationFrame(animate);
}

window.addEventListener('click', (e) =>
{
    if (!dont_click_again)
    {
        for (let i = 0; i < squares.length; i++)
        {
            if (squares[i].contains(e.x, e.y))
            {
                start = true;
                dont_click_again = true;
                now = new Date();

                var time = (now.getTime() - prev.getTime()) / 1000
                
                results[current_round].time = time;
                results[current_round].hit_target = squares[i].target;

                current_round++;

                return;
            }
        }
    }
});

window.addEventListener('load', (e) =>
{
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
});

function set_values() 
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 
    width = canvas.width;
    height = canvas.height;
    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;

    intro_ui.style.display = "none";
    canvas.style.display = "inline-block";

    ctx.font = "bold 15vmin Times New Roman"

    var min = Math.min(width / 2, height / 2);

    var round = rounds[current_round];

    gapsize = 0;
    if (round.gap) gapsize = min / 15;
    var square_gap_size = min / 15
    squaresize = (min - (3 * square_gap_size)) * 0.25;

    grid_width = squaresize*4 + gapsize*3;
    grid_height = grid_width;

    var basex = width * 0.5 - (grid_width * 0.5);
    var basey = height * 0.4 - (grid_height * 0.5);

    squares = [];
    for (let j = 0; j < 4; j++)
    {
        for (let i = 0; i < 4; i++)
        {
            var color = {
                r: round.color.r,
                g: round.color.g,
                b: round.color.b
            };

            var index = j*4 +i;
            if (index == round.target_index)
            {
                color.r += round.target_change.r;
                color.g += round.target_change.g;
                color.b += round.target_change.b;
            }

            if (current_round >= 0 && index != round.target_index)
            {
                if (round.rand_change == 1)
                {
                    color.r += arbitrary_int_inclusive(10, 120);
                }
                else if (round.rand_change == 2)
                {
                    color.g += arbitrary_int_inclusive(10, 120);
                }
                else if (round.rand_change == 3)
                {
                    color.b += arbitrary_int_inclusive(10, 120);
                }
            }
            
            var tl = {
                x: basex + i*squaresize + i*gapsize,
                y: basey + j*squaresize + j*gapsize
            };

            var br = {
                x: basex + (i+1)*squaresize + i*gapsize,
                y: basey + (j+1)*squaresize + j*gapsize 
            };

            squares.push(
                new Square(
                    color,
                    tl,
                    br
                )
            );
        }
    }

    gapsize = min / 15;

    var tl = {
        x: basex + squaresize - gapsize,
        y: basey + grid_height + gapsize 
    }
    var br = {
        x: basex + grid_width - squaresize + gapsize,
        y: basey + grid_height + gapsize + squaresize*0.75
    }
    squares.push(
        new Square(
            {r:255, g:255, b:255},
            tl, br
        )
    );

    squares[rounds[current_round].target_index].target = true;
}

function randInt(max)
{
    return Math.floor(Math.random() * max);
}

document.getElementById("intro-start").addEventListener("click", (e) =>
{
    for (let i = 0; i < blue_text_indices.length; i++)
    {
        rounds.push(
            blue_text[blue_text_indices[i]]
        );
    }

    for (let i = 0; i < red_text_indices.length; i++)
    {
        rounds.push(
            red_text[red_text_indices[i]]
        );
    }

    for (let i = 0; i < green_text_indices.length; i++)
    {
        rounds.push(
            green_text[green_text_indices[i]]
        );
    }

    for (let i = 0; i < yellow_text_indices.length; i++)
    {
        rounds.push(
            yellow_text[yellow_text_indices[i]]
        );
    }

    for (let i = 0; i < num_rounds; i++)
    {
        results.push({
            time: 0,
            target_index: rounds[i].target_index,
            hit_target: false,
            round: i
        })
    }
    
    set_values();

    animate(0);

    var x = setInterval((e) =>
    {
        if (countdown_timer == 0)
        {
            draw = true;
            started = true;
            clearInterval(x);
        }
        else 
        {
            ctx.clearRect(0,0,width, height);
            ctx.fillText(countdown_timer, width/2, height/2);
            countdown_timer--;
        }
    }, 1000);
});

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    if (!done && started)
    {
        redraw = true;
        set_values();
    }
}

document.getElementById("submit-name").addEventListener('click', (e) =>
{
    if (done)
    {
        var text = document.getElementById("name-input").value;
        if (text === "")
        {
            alert("Please Enter A Name");
        }
        else 
        {
            name_entered = true;
            document.getElementById("linky").style.display = "inline-block";
            on_finish(text);
        }
    }
    
});