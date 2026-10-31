/**
 * ====================================================================
 * 🎂 BIRTHDAY WEBSITE CONFIGURATION
 * ====================================================================
 * Customize everything for your best friend right here!
 * Change the name, secret age, letter text, reasons, photos, and music.
 */

const BIRTHDAY_CONFIG = {
  // 💖 Recipient Information
  name: "Sanuu",
  nickname: "Sanu baby",
  birthdayDate: "November 1",
  
  // 🔐 Age Lock Screen
  // Change this to her exact 2-digit age (e.g., "19", "20", "21", "22")
  correctAge: "19",
  agePromptTitle: "Enter Your Age",
  agePromptSubtitle: "Only the birthday girl has the secret key to unlock this surprise 🌸",
  ageErrorMessage: "Oops! That's not right, birthday girl 💗 Try again!",
  ageSuccessMessage: "Age unlocked! Loading your special surprise... ✨",

  // 💌 Page 2: Special Birthday Letter
  letter: {
    envelopePrompt: "You have a special letter!",
    envelopeSubtext: "Tap the wax seal to open your birthday letter 💌",
    salutation: "My Dearest Sanuu,",
    paragraphs: [
      "Happy, happiest birthday to the most special person in my life! ❤️🥹 Aaj ka din us insaan ke naam hai jo meri life mein itni special jagah rakhti hai. Honestly, mujhe kabhi-kabhi samajh hi nahi aata ki tumhare liye apni feelings ko words mein kaise express karun. Shayad tumhe khud bhi andaaza nahi hai ki tum mere liye kitni important ho.",
      "Pata nahi kab aur kaise, but somewhere along the way tum mere liye sirf ek best friend se badhkar ban gayi. Tumhari smile, tumhari baatein, tumhara pagalpan aur tumhari chhoti-chhoti aadatein, pata nahi kyun, mujhe tumhari har ek baat special lagti hai. Tumhari personality mein kuch toh alag hai jo tumhe baaki sabse different banata hai. Aur honestly, mujhe tum jaisi ho, bilkul waisi hi bahut pasand ho. ❤️",
      "Tumhare saath random conversations karna, bina kisi reason ke hasna aur chhoti-chhoti baatein share karna, mere favourite moments mein se hain. Kabhi-kabhi tumhara ek simple sa message bhi mera poora mood better kar deta hai. Shayad tumhe realize bhi nahi hota, but tumhari presence hi ordinary moments ko itna beautiful bana deti hai.",
      "Aaj tumhare birthday par meri bas yahi wish hai ki tumhari life endless happiness, success, love aur beautiful memories se bhari rahe. Tumhare saare dreams poore hon aur tumhe life mein woh sab kuch mile jo tum truly deserve karti ho. Main nahi jaanta future mein kya hoga, but itna zaroor jaanta hoon ki tum mere liye hamesha bahut special rahogi. Bas hamesha aise hi smile karti rehna, kyunki tumhari smile genuinely bahut precious hai.",
      "Thank you for being YOU. Shayad main har baar express nahi kar pata, but I genuinely feel lucky ki tum meri life ka part ho. Kabhi-kabhi lagta hai ki chahe main kitne bhi words likh loon, woh kabhi enough nahi honge tumhe batane ke liye ki tum mere liye kitni special ho. Happiest Birthday once again! Hamesha khush rehna, aise hi shine karti rehna aur kabhi mat bhoolna ki koi hai jo tumhe words se bhi zyada special maanta hai. ❤️🫶🏻🎂"
    ],
    closing: "Forever & Always Your Best Friend,",
    signature: "With all my love ❤️"
  },

  // ❤️ Page 3: "Why Do I Like You?" (Reasons Why You're Special)
  reasons: [
    {
      id: 1,
      icon: "✨",
      tag: "NATURE",
      title: "YOUR SMILE",
      description: "Tumhari smile meri favourite hai. Pata nahi kyun, bas tumhe haste dekhkar mera din achha ho jaata hai."
    },
    {
      id: 2,
      icon: "🎧",
      tag: "YOUR FEEL LIKE MY SAFE PLACE",
      title: "YOUR FEEL LIKE MY SAFE PLACE",
      description: "Tumse baat karke sukoon milta hai. Tumhare saath main bina kisi hesitation ke khud jaisa reh sakta hoon. You feel like home to me. ❤️"
    },
    {
      id: 3,
      icon: "💗",
      tag: "Your Care",
      title: "Your Care",
      description: "Tum jis tarah meri care karti ho, meri chhoti-chhoti baaton ko samajhti ho, woh mere liye bahut special hai."
    },
    {
      id: 4,
      icon: "🥹",
      tag: "Your Presence",
      title: "Your Presence",
      description: "Tumse baat karna aur tumhare saath time spend karna mere favourite moments mein se ek hai."
    },
    {
      id: 5,
      icon: "🌷",
      tag: "Your Uniqueness",
      title: "Your Uniqueness",
      description: "Tumhari har chhoti-badi baat tumhe mere liye different aur special banati hai."
    },
    {
      id: 6,
      icon: "❤️",
      tag: "Because You Are You",
      title: "Because You Are You",
      description: "Mujhe tumse pyaar karne ke liye koi particular reason nahi chahiye. Tum jaisi ho, bas waisi hi mujhe bahut pasand ho. ❤️"
    }
  ],

  // Special closing message displayed after all reasons
  reasonsClosingMessage: "And honestly, 6 reasons toh sirf shuruaat hain. I could write a thousand reasons, and still they wouldn't be enough to explain how special you are to me and You are my first love 🥹❤️ I love you musu. ❤️🫶",

  // 📸 Page 4: Photo Gallery (Polaroid Memories)
  // To use your own real photos, simply place your photos into 'assets/images/'
  // and update the 'image' paths below (e.g., 'assets/images/my_photo1.jpg').
  memories: [
    {
      id: 1,
      image: "photo1.webp",
      date: "Spring Memories",
      rotate: "-2.5deg"
    },
    {
      id: 2,
      image: "photo2.webp",
      date: "Sunset Walk",
      rotate: "3deg"
    },
    {
      id: 3,
      image: "photo3.webp",
      date: "Crazy Moments",
      rotate: "-1.8deg"
    },
    {
      id: 4,
      image: "photo4.webp",
      date: "Special Day",
      rotate: "2.2deg"
    },
    {
      id: 5,
      image: "photo5.webp",
      date: "Unbreakable Bond",
      rotate: "-3deg"
    },
    {
      id: 6,
      image: "photo6.webp",
      date: "Forever & Ever",
      rotate: "1.5deg"
    },
    {
      id: 7,
      image: "photo7.jpeg",
      date: "Midnight Cravings",
      rotate: "-2deg"
    },
    {
      id: 8,
      image: "photo8.webp",
      caption: "FAVOURITE PERSON 🫶",
      date: "Adventure Time",
      rotate: "2.8deg"
    },
    {
      id: 9,
      image: "photo9.jpeg",
      date: "Sunny Afternoons",
      rotate: "-1.2deg"
    },
    {
      id: 10,
      image: "photo10.jpeg",
      date: "Cozy Vibes",
      rotate: "3.2deg"
    },
    {
      id: 11,
      image: "photo11.jpeg",
      date: "Sleepover Nights",
      rotate: "-2.7deg"
    },
    {
      id: 12,
      image: "photo12.jpeg",
      date: "Summer Holiday",
      rotate: "1.8deg"
    },
    {
      id: 13,
      image: "photo13.jpeg",
      date: "Baking Chaos",
      rotate: "-3.2deg"
    },
    {
      id: 14,
      image: "photo14.jpeg",
      date: "Late Night Talks",
      rotate: "2deg"
    },
    {
      id: 15,
      image: "photo15.webp",
      caption: "kuchu puchu🎀📸",
      date: "Pure Shenanigans",
      rotate: "-1.5deg"
    },
    {
      id: 16,
      image: "photo16.webp",
      caption: "Forever my best friend, happy birthday! 💖🎉",
      date: "Unconditional Love",
      rotate: "2.5deg"
    }
  ],

  // 🎂 Page 5: The Final Birthday Surprise
  finalSurprise: {
    heading: "HAPPY BIRTHDAY SANUU!",
    subheading: "Make a wish and blow out the candles 🕯️✨",
    candleBlowText: "Tap the candles or button to blow them out!",
    candlesBlownMessage: "🎉 Your wish is on its way to the stars! ✨💖",
    wishCardTitle: "A Birthday Wish For You",
    wishCardText: "Dua hai ki tumhari life ka ye naya saal tumhare liye dher saari sachchi khushiyan, achhi health, exciting adventures, unforgettable love aur tumhare dil mein chhupe har ek sapne ko poora karne ke naye mauke lekar aayeTum duniya ki har khushi deserve karti ho, balki usse bhi kahin zyada!.",
    finalQuote: "“Good friends are like stars — you don't always see them, but you know they're always there.”",
    signature: "Happy Birthday, Bestie! Forever grateful for you 💕 KA TIMI KAHILE MALAI CHHODERA TA JAADAINAU NI? 🥺❤️ Love you sanu🫶" ,
  },

  // 🎵 Background Music Configuration
  music: {
    // If you have an mp3 file, put it in 'assets/music/song.mp3' and set path here
    // If no custom mp3 is found, our dreamy built-in Web Audio chime will play automatically!
    customAudioPath: "assets/music/birthday-lofi.mp3",
    title: "Dreamy Birthday Lofi Melody"
  }
};

// Export to global scope for browser usage
window.BIRTHDAY_CONFIG = BIRTHDAY_CONFIG;
