(() => {
  const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=960&q=82`;
  const posts = [
    {
      slug: "build-an-english-study-routine",
      title: "Build an English Study Routine You Can Actually Keep",
      category: "Study habits",
      time: "4 min read",
      summary: "A realistic weekly plan beats an intense schedule you abandon after three days.",
      image: image("photo-1434030216411-0b793f4b4173"),
      alt: "Learner writing notes beside a notebook",
      paragraphs: [
        "The best study routine is one that fits your real life. Start by choosing a small, repeatable time slot: fifteen minutes after breakfast, a short review on the bus, or a longer session twice a week. Consistency helps your brain meet English often enough to remember it.",
        "Give each session a simple purpose. You might review yesterday's vocabulary, listen to a short clip, read one page, or write a few sentences. Rotate skills across the week rather than trying to master everything in a single sitting. Keep a note of what you did so your next session is easy to begin.",
        "At the end of the week, notice what worked and adjust the plan. If you missed a day, simply continue at the next opportunity. A routine should support learning, not make you feel guilty."
      ],
      takeaway: "Choose a small daily action and attach it to a habit you already have."
    },
    {
      slug: "learn-vocabulary-in-context",
      title: "Learn New Vocabulary in Context, Not in Long Lists",
      category: "Vocabulary",
      time: "4 min read",
      summary: "Remember useful words by meeting them in sentences and using them yourself.",
      image: image("photo-1456513080510-7bf3a84b82f8"),
      alt: "Open books and study materials on a desk",
      paragraphs: [
        "A word on a flashcard can be easy to recognize and surprisingly hard to use. Context gives it a situation, grammar pattern, and natural partners. Instead of memorizing only “decision,” learn a phrase such as “make a decision” and notice the kinds of situations where people use it.",
        "When you meet a new word, write down the sentence around it, mark the part of speech, and make one new example about your own life. Review the word after a day, a few days, and a week. Short retrieval practice is more useful than rereading a long list.",
        "Keep your collection selective. Save words you have seen more than once or genuinely need for your goals. A smaller vocabulary notebook that you revisit is more powerful than hundreds of forgotten entries."
      ],
      takeaway: "Save a useful phrase and create one original sentence with it."
    },
    {
      slug: "speak-english-without-waiting-for-perfect",
      title: "Speak English Without Waiting to Be Perfect",
      category: "Speaking",
      time: "4 min read",
      summary: "Confidence grows through manageable practice, not through waiting for every sentence to be flawless.",
      image: image("photo-1521737711867-e3b97375f902"),
      alt: "Small group talking together in a bright room",
      paragraphs: [
        "Many learners understand more English than they feel comfortable saying. The gap often comes from trying to plan a perfect sentence before speaking. Give yourself permission to use a simpler sentence, pause, and explain an idea another way.",
        "Practise with low-pressure tasks first. Describe your breakfast for one minute, summarize a short video, or record a voice note about your day. Listen once for a strength and once for one thing to improve. Repeating the same topic a second time often makes your speech clearer and smoother.",
        "In conversation, useful phrases buy you time: “Let me think,” “What I mean is…,” and “Could you say that again?” Communication is a skill you build by using it, including when a word does not come immediately."
      ],
      takeaway: "Record one short voice note today; focus on sharing an idea, not being perfect."
    },
    {
      slug: "english-listening-practice",
      title: "Make English Listening Practice Work for You",
      category: "Listening",
      time: "5 min read",
      summary: "Use short audio in a repeatable routine to understand more than just individual words.",
      image: image("photo-1516321318423-f06f85e504b3"),
      alt: "Learner using a laptop for online study",
      paragraphs: [
        "Listening can feel difficult because spoken English connects sounds, reduces syllables, and moves quickly. Begin with a short clip that is only slightly challenging. A minute or two is enough to practise carefully without losing the main idea.",
        "Listen once without stopping and write down the general topic. On the second listen, note key words or phrases. If a transcript is available, check it after listening, then replay the parts that were difficult. This sequence trains comprehension instead of turning every listening task into a reading exercise.",
        "Repeat the same clip on another day. Familiarity lets you notice details you missed the first time, and regular exposure helps you recognize common sound patterns."
      ],
      takeaway: "Use a short clip three ways: main idea, key details, then transcript check."
    },
    {
      slug: "english-pronunciation-practice-at-home",
      title: "Practise English Pronunciation at Home",
      category: "Speaking",
      time: "4 min read",
      summary: "A simple listen, notice, and repeat cycle can make your speech easier to understand.",
      image: image("photo-1517842645767-c639042777db"),
      alt: "Notebook open during a focused study session",
      paragraphs: [
        "Clear pronunciation is not about removing your accent. It is about helping listeners understand your words. Choose a short sentence from a trusted audio source and listen for one feature, such as a final consonant, word stress, or the rhythm of a question.",
        "Repeat the sentence slowly, then at a natural speed. Record yourself and compare the rhythm rather than judging every sound. Breaking a long word into syllables can help, but practise the word again inside a full sentence so it does not stay isolated.",
        "Work on one pronunciation goal at a time. A few minutes of focused repetition is more effective than trying to correct every sound in every conversation."
      ],
      takeaway: "Pick one sentence, imitate its rhythm, and record a second attempt."
    },
    {
      slug: "simple-english-grammar-error-check",
      title: "A Quick Self-Check for Common English Grammar Errors",
      category: "Grammar",
      time: "5 min read",
      summary: "A calm editing checklist helps you catch errors without rewriting every sentence.",
      image: image("photo-1498050108023-c5249f4df085"),
      alt: "Laptop and notebook ready for editing and study",
      paragraphs: [
        "When you finish a paragraph, avoid checking every possible grammar rule at once. Read it in short passes. First check whether each sentence has a clear subject and verb. Next, look at verb tense and ask whether it matches the time you mean.",
        "Then check small words that are easy to miss: articles, plural endings, and prepositions. Read the text aloud at a steady pace; awkward pauses can show where a sentence needs attention. If you are unsure about a rule, look up one example and compare it with your sentence.",
        "Keep a personal list of recurring errors. Reviewing your own top three patterns is more useful than memorizing a long list of mistakes you rarely make."
      ],
      takeaway: "Edit in three passes: sentence structure, verb time, and small endings."
    },
    {
      slug: "english-speaking-practice-alone",
      title: "How to Practise Speaking English When You Are Alone",
      category: "Speaking",
      time: "4 min read",
      summary: "Solo speaking exercises turn everyday moments into useful rehearsal.",
      image: image("photo-1503676260728-1c00da094a0b"),
      alt: "Student studying at a desk with books",
      paragraphs: [
        "You do not need a conversation partner every time you want to practise speaking. Narrate a familiar activity, explain how to make a cup of tea, or describe what you can see on your walk. Familiar topics leave more attention for finding words and forming sentences.",
        "Try a one-minute challenge: speak on a topic without stopping, even if you need to rephrase. Then choose one sentence you want to improve. Look up a useful expression, practise again, and notice whether the second attempt feels easier.",
        "Voice recordings provide a record of progress. Save one each week and compare them after a month. You may notice clearer organization and fewer long pauses even before every grammar detail feels perfect."
      ],
      takeaway: "Explain a familiar task aloud for one minute and try it again with one new phrase."
    },
    {
      slug: "email-english-professional",
      title: "Write Clear, Polite Emails in English",
      category: "Professional English",
      time: "5 min read",
      summary: "A simple structure makes professional emails easier to write and easier to answer.",
      image: image("photo-1497366754035-f200968a6e72"),
      alt: "Bright professional workspace with a desk and chair",
      paragraphs: [
        "A useful work email helps the reader understand the purpose quickly. Start with an appropriate greeting, state your reason for writing in the first few lines, and organize any details into short paragraphs or bullets.",
        "Polite language can be direct without sounding abrupt. “Could you please send the updated file by Thursday?” is clear and respectful. If you are making a request, explain any relevant deadline and say what should happen next. A short subject line such as “Meeting notes for Tuesday” also helps.",
        "Before sending, check the recipient's name, attachments, dates, and the action you are asking for. Remove details that do not help the reader respond. Clear writing is usually kinder than complicated writing."
      ],
      takeaway: "Make the purpose, requested action, and deadline easy to find."
    },
    {
      slug: "prepare-english-job-interview",
      title: "Prepare for a Job Interview in English",
      category: "Professional English",
      time: "5 min read",
      summary: "Prepare flexible examples and practise explaining your experience clearly.",
      image: image("photo-1551836022-d5d88e9218df"),
      alt: "Colleagues having a professional conversation",
      paragraphs: [
        "Interview preparation is not about memorizing a speech. Prepare a few short examples that show how you solved a problem, worked with others, learned something, or handled a challenge. Use a simple structure: situation, action, result, and what you learned.",
        "Practise common questions aloud, but vary the wording so you can respond naturally. If you need a moment, say “That is a good question; let me think of an example.” This is clearer than rushing into an answer you have not organized.",
        "Prepare two questions for the interviewer and learn useful job-specific vocabulary. A mock interview with a teacher or friend can help you hear where your answer needs a more concrete detail."
      ],
      takeaway: "Prepare three real examples and practise telling each one in under two minutes."
    },
    {
      slug: "ielts-and-toefl-choose-exam",
      title: "IELTS or TOEFL: How to Choose Your English Exam",
      category: "Exam preparation",
      time: "5 min read",
      summary: "Compare the requirements of your target institution before choosing an exam.",
      image: image("photo-1509062522246-3755977927d7"),
      alt: "Study notes prepared for an English exam",
      paragraphs: [
        "There is no universally best choice between IELTS and TOEFL. The right test depends on which exams your university, employer, or immigration process accepts, what score you need, and which format you can prepare for effectively.",
        "Read the official requirements for your specific destination and course. Check the accepted test versions, minimum overall score, section minimums, and how recent the result must be. Then compare practice materials and the way each test assesses speaking, writing, listening, and reading.",
        "Take a timed sample before booking. Your results can show which skills need work and whether the question style feels comfortable. Allow time for preparation and score delivery rather than selecting a date at the last minute."
      ],
      takeaway: "Confirm the exact score and test-version requirements with the institution first."
    },
    {
      slug: "study-english-with-movies",
      title: "Learn English with Movies Without Turning Fun into Homework",
      category: "Study habits",
      time: "4 min read",
      summary: "Use short scenes and selective subtitles to learn phrases naturally.",
      image: image("photo-1489599849927-2ee91cede3ba"),
      alt: "Cinema screen ready for a film",
      paragraphs: [
        "Movies expose you to voices, expressions, and situations that textbook examples may not include. You do not need to understand every line. Choose a short scene where the setting and action make the meaning easier to follow.",
        "Watch once for enjoyment and the overall story. Watch again with English subtitles and note two or three expressions you might use. Look at how a phrase changes with tone or relationship; a friendly conversation and a formal request call for different language.",
        "Replay one line and say it aloud, paying attention to stress and rhythm. Then close the subtitles and see what you can understand. Keep the exercise short so you still enjoy the film."
      ],
      takeaway: "Choose one short scene and save just three useful expressions."
    },
    {
      slug: "read-english-every-day",
      title: "A Simple Guide to Reading English Every Day",
      category: "Reading",
      time: "4 min read",
      summary: "Choose engaging texts at a manageable level and read for meaning first.",
      image: image("photo-1516979187457-637abb4f9353"),
      alt: "Reader enjoying a book in a comfortable place",
      paragraphs: [
        "Daily reading builds vocabulary and helps you notice how sentences fit together. Pick material you genuinely want to read: a short news story, a graded reader, a recipe, or a topic you already know something about.",
        "On the first pass, continue even when a few words are unfamiliar. Try to understand the main idea from context. On the second pass, look up only words that appear important or keep returning. Save an example sentence rather than copying a dictionary definition alone.",
        "Finish by summarizing the text in two or three sentences, aloud or in writing. This small step checks what you understood and turns reading into active language practice."
      ],
      takeaway: "Read for the main idea first; look up only the words that matter."
    },
    {
      slug: "use-english-phrasal-verbs",
      title: "Learn Phrasal Verbs Through Real-Life Situations",
      category: "Vocabulary",
      time: "4 min read",
      summary: "Group phrasal verbs by meaning and situation instead of memorizing an alphabetized list.",
      image: image("photo-1523240795612-9a054b0db644"),
      alt: "Students learning together at a table",
      paragraphs: [
        "Phrasal verbs can feel unpredictable because a small particle changes the meaning of a familiar verb. Learning them in context makes the difference easier to remember. “Pick up” can mean collect someone, learn a skill informally, or lift an object; the surrounding words show which meaning is intended.",
        "Organize new phrases around situations. At work, you might “set up” a meeting, “find out” a detail, or “follow up” with a colleague. Write a short dialogue using two of the phrases instead of collecting unrelated examples.",
        "Notice whether the object can move: “turn the volume down” and “turn down the volume” are both possible. A good learner's dictionary can show patterns and example sentences."
      ],
      takeaway: "Learn two related phrasal verbs inside a short, realistic dialogue."
    },
    {
      slug: "write-english-paragraph",
      title: "Write a Better English Paragraph, One Step at a Time",
      category: "Writing",
      time: "5 min read",
      summary: "A clear main idea and a few well-connected details make writing easier to follow.",
      image: image("photo-1455390582262-044cdead277a"),
      alt: "Hand writing a paragraph in a notebook",
      paragraphs: [
        "Before writing, decide what you want the reader to understand. Put that main idea in a topic sentence. Add two or three details, reasons, or examples that support it, then finish with a sentence that connects the information back to your point.",
        "Use linking words to show relationships, not just to decorate a paragraph. “Because” introduces a reason, “however” signals contrast, and “for example” introduces evidence. If every sentence begins with a connector, remove the ones that do not help.",
        "After drafting, check organization before small grammar details. Does each sentence support the main point? Then edit verb forms, punctuation, and spelling in a separate pass."
      ],
      takeaway: "Write one main idea, support it with two details, then edit in a second pass."
    },
    {
      slug: "english-small-talk",
      title: "Make English Small Talk Feel More Natural",
      category: "Speaking",
      time: "4 min read",
      summary: "Simple follow-up questions and active listening turn a greeting into a conversation.",
      image: image("photo-1528605248644-14dd04022da1"),
      alt: "Friends sharing a conversation over a meal",
      paragraphs: [
        "Small talk is less about finding a perfect topic and more about showing interest. Begin with something appropriate to the situation, such as how someone knows the host, what they thought of a talk, or how their week is going.",
        "Listen for one detail you can ask about. If someone says they spent the weekend hiking, you could ask where they went or what the trail was like. Share a little about yourself too, so the exchange does not feel like an interview.",
        "Prepare a few conversational bridges: “How did you get interested in that?” or “What was that like?” These questions invite a fuller answer and help you keep a conversation moving naturally."
      ],
      takeaway: "Ask one follow-up question based on a detail you genuinely heard."
    },
    {
      slug: "english-articles-a-an-the",
      title: "A, An, or The? A Practical Guide to English Articles",
      category: "Grammar",
      time: "5 min read",
      summary: "Think about whether the reader knows exactly which person or thing you mean.",
      image: image("photo-1507842217343-583bb7270b66"),
      alt: "Rows of books in a library",
      paragraphs: [
        "English articles become easier when you ask what the listener knows. Use “a” or “an” when introducing one countable thing for the first time: “I saw a bird.” Use “the” when the listener can identify which one: “The bird was on our balcony.”",
        "The choice between “a” and “an” depends on the first sound, not simply the first letter. We say “an hour” because the h is silent, and “a university” because it begins with a /y/ sound.",
        "Some general statements use no article, such as “Books can be expensive.” Learn common patterns through complete examples, and notice how meaning changes when a noun becomes specific."
      ],
      takeaway: "Ask yourself: am I introducing something, or does the listener know which one?"
    },
    {
      slug: "improve-english-memory-spaced-review",
      title: "Remember English Longer with Spaced Review",
      category: "Study habits",
      time: "4 min read",
      summary: "Return to new language over time instead of cramming everything into one session.",
      image: image("photo-1513475382585-d06e58bcb0e0"),
      alt: "Online learning session on a laptop",
      paragraphs: [
        "It is normal to forget some of what you studied yesterday. Memory becomes stronger when you bring information back after a delay. A quick review the next day, a few days later, and again the following week gives your brain several chances to retrieve it.",
        "Make reviews active. Cover the translation and try to remember the phrase, complete a sentence from memory, or explain a grammar point without looking at your notes. Then check the answer and correct it.",
        "Keep review sessions short and prioritize the items that are hardest to recall. Do not spend equal time on phrases you already use confidently and ones that still disappear from memory."
      ],
      takeaway: "Schedule three short recall sessions for any new phrase you want to keep."
    },
    {
      slug: "english-travel-phrases",
      title: "Useful English Phrases for Confident Travel",
      category: "Everyday English",
      time: "4 min read",
      summary: "Practise the situations you are likely to meet, from checking in to asking for directions.",
      image: image("photo-1500530855697-b586d89ba3ee"),
      alt: "Open landscape that suggests travel and exploration",
      paragraphs: [
        "Travel English is most useful when you practise complete requests. At a hotel, you might say, “I have a reservation under the name…” or “Could you tell me what time breakfast starts?” At a station, “Which platform does the train leave from?” is direct and clear.",
        "Learn polite repair phrases too. “Could you repeat that more slowly?” and “Could you show me on the map?” help when you do not understand. You do not need complicated English to solve a problem.",
        "Before a trip, practise short role-plays for your own plans. Think about the places you will visit, save essential details, and rehearse explaining what you need."
      ],
      takeaway: "Practise three phrases for the situations you expect on your trip."
    },
    {
      slug: "english-exam-study-plan",
      title: "Create an English Exam Study Plan That Reduces Stress",
      category: "Exam preparation",
      time: "5 min read",
      summary: "Work backward from exam day and give each study session a specific skill target.",
      image: image("photo-1491841550275-ad7854e35ca6"),
      alt: "Study books and notes arranged on a desk",
      paragraphs: [
        "Start with the exam date and list the skills or task types you need to practise. Take a timed sample early so you can identify strengths and gaps. That first result is a planning tool, not a final judgment of your ability.",
        "Divide the remaining weeks into focused sessions. Practise a task, review what went wrong, and repeat it after a few days. Include timed practice closer to the exam, but leave enough time to learn from each attempt rather than completing test after test without reflection.",
        "Protect sleep and plan practical details such as transport, identification, and test rules. A steady preparation routine and a calm exam-day plan work together."
      ],
      takeaway: "Use a diagnostic practice test to decide what to study next, not just how you scored."
    },
    {
      slug: "business-english-meetings",
      title: "Speak Up with Confidence in English Meetings",
      category: "Professional English",
      time: "4 min read",
      summary: "A few reliable phrases can help you contribute, clarify, and disagree respectfully.",
      image: image("photo-1521737604893-d14cc237f11d"),
      alt: "Team collaborating around a shared table",
      paragraphs: [
        "Meeting confidence often comes from knowing how to enter the conversation. Try “Could I add something here?” or “I would like to build on that point.” If you need clarification, ask “Could you explain what you mean by…?” rather than staying uncertain.",
        "To disagree politely, acknowledge the idea before giving your perspective: “I see the benefit. One concern might be…” Then support your view with a reason or example. Clear structure helps listeners follow your point even if your grammar is not perfect.",
        "Before a meeting, note one question and one contribution you may want to make. Preparing a few key terms can reduce the pressure of finding everything spontaneously."
      ],
      takeaway: "Prepare one useful question and one idea before your next meeting."
    },
    {
      slug: "english-level-cefr-explained",
      title: "What Do English Levels A1 to C2 Actually Mean?",
      category: "Learning goals",
      time: "5 min read",
      summary: "CEFR levels describe what learners can do across different real-life communication tasks.",
      image: image("photo-1523580846011-d3a5bc25702b"),
      alt: "Students walking across a university campus",
      paragraphs: [
        "The Common European Framework of Reference for Languages, or CEFR, describes language ability from A1 beginner to C2 proficient. The levels are broad guides to what a person can do, not labels for a person's intelligence or potential.",
        "At A1 and A2, learners handle familiar expressions and everyday exchanges. B1 and B2 describe increasing independence, from managing common situations to communicating more fluently across a wider range of topics. C1 and C2 involve flexible, precise use of English in demanding contexts.",
        "A level can vary by skill. Someone may read at B2 while speaking at B1, for example. A short online quiz can provide an initial estimate, but a fuller placement considers speaking, listening, reading, and writing."
      ],
      takeaway: "Use a level as a guide to your next learning goal, not as a permanent label."
    },
    {
      slug: "online-english-class-success",
      title: "Get More from Your Online English Class",
      category: "Study habits",
      time: "4 min read",
      summary: "A little preparation and active participation make online lessons more rewarding.",
      image: image("photo-1516321497487-e288fb19713f"),
      alt: "Student taking part in an online lesson on a laptop",
      paragraphs: [
        "Before class, check your connection and keep a notebook or digital document ready. Review the previous lesson for a few minutes and write down one question. This makes it easier to join the lesson actively from the beginning.",
        "During class, try to speak even when you are unsure. Ask for an example, request a slower explanation, or repeat a new phrase in your own sentence. These moments help your teacher see what you understand and what needs another explanation.",
        "After class, choose a few notes to review rather than copying everything again. Use the new language in a short message or voice note within a day so it becomes part of your own communication."
      ],
      takeaway: "Bring one question to class and use one new phrase afterward."
    },
    {
      slug: "english-listening-accents",
      title: "Understand Different English Accents with More Confidence",
      category: "Listening",
      time: "5 min read",
      summary: "Build listening flexibility gradually by focusing on meaning and sound patterns.",
      image: image("photo-1524504388940-b1c1722653e1"),
      alt: "Person listening attentively in a bright setting",
      paragraphs: [
        "English sounds different around the world, and even speakers from the same region vary. You do not need to master every accent. The goal is to become flexible enough to follow speakers whose voices and pronunciation are less familiar.",
        "Start with clear recordings on topics you know. Listen for stressed words and the main message before focusing on individual sounds. Then try another speaker on the same topic, so you can use the context to support what you hear.",
        "If a phrase is unclear, listen for key words and ask for repetition when you can. Familiarity grows through varied, regular exposure, not by forcing yourself to understand a fast recording that is far beyond your current level."
      ],
      takeaway: "Listen to two different speakers discussing a topic you already understand."
    },
    {
      slug: "set-realistic-english-goals",
      title: "Set English Goals You Can See Yourself Reaching",
      category: "Learning goals",
      time: "3 min read",
      summary: "Turn a broad ambition into a small action and a clear way to notice progress.",
      image: image("photo-1470770841072-f978cf4d019e"),
      alt: "A path through a scenic landscape",
      paragraphs: [
        "“Improve my English” is a meaningful ambition, but it does not tell you what to do today. Make the goal specific: understand a short podcast without subtitles, write a clear work email, or speak for two minutes about a familiar topic.",
        "Choose a practice action that supports the goal and decide how often you will do it. For example, listen to one short clip three times a week and summarize it in a voice note. Keep a simple record so you can compare your first attempt with later ones.",
        "Review your goal every few weeks. If it is too difficult, make the next step smaller. If you have reached it, choose a new challenge. Progress is easier to sustain when you can recognize it."
      ],
      takeaway: "Write one goal, one weekly practice action, and one way to measure improvement."
    },
    {
      slug: "english-grammar-practice-not-worksheets",
      title: "Practise English Grammar Beyond Worksheets",
      category: "Grammar",
      time: "4 min read",
      summary: "Move from recognizing a grammar rule to using it in your own communication.",
      image: image("photo-1453738773917-9c3eff1db985"),
      alt: "Learner working through written English practice",
      paragraphs: [
        "Grammar exercises can help you notice a pattern, but choosing an answer is not the same as using the pattern in conversation. After you finish an exercise, write three original sentences or tell a short story using the grammar you practised.",
        "Use topics that matter to you. If you are learning the past tense, describe a recent weekend. If you are practising future forms, explain a plan. Personal examples give the grammar a memorable meaning and reveal which parts you still find difficult.",
        "Ask for feedback on a small sample, then correct it and use the revised sentences again. The aim is not to avoid mistakes; it is to turn feedback into more accurate, confident communication."
      ],
      takeaway: "After a grammar exercise, create three sentences about your real life."
    }
  ];

  const postGrid = document.getElementById("postGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const postCount = document.getElementById("postCount");
  const blogContent = document.getElementById("blogContent");
  const articleView = document.getElementById("articleView");
  const blogSection = document.getElementById("blog");
  const pageTitle = document.title;
  const categories = [...new Set(posts.map((post) => post.category))].sort();

  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  function makeCard(post) {
    const card = document.createElement("article");
    card.className = "blog-card";
    const link = document.createElement("a");
    link.className = "blog-read-link";
    link.href = `#blog/${encodeURIComponent(post.slug)}`;
    link.setAttribute("aria-label", `Read ${post.title}`);
    link.textContent = "Read article";
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    link.appendChild(arrow);

    const img = document.createElement("img");
    img.className = "blog-image";
    img.src = post.image;
    img.alt = post.alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      img.src = "assets/blog-placeholder.svg";
    }, { once: true });

    const content = document.createElement("div");
    content.className = "blog-card-content";
    const meta = document.createElement("div");
    meta.className = "blog-meta";
    const category = document.createElement("span");
    category.className = "blog-category";
    category.textContent = post.category;
    const time = document.createElement("span");
    time.textContent = post.time;
    meta.append(category, time);

    const title = document.createElement("h3");
    title.textContent = post.title;
    const summary = document.createElement("p");
    summary.textContent = post.summary;
    content.append(meta, title, summary, link);
    card.append(img, content);
    return card;
  }

  function renderPosts() {
    blogContent.hidden = false;
    articleView.hidden = true;
    articleView.replaceChildren();
    document.title = pageTitle;
    const query = searchInput.value.trim().toLocaleLowerCase();
    const category = categoryFilter.value;
    const visiblePosts = posts.filter((post) => {
      const matchesCategory = category === "all" || post.category === category;
      const searchableText = [post.title, post.summary, post.category, ...post.paragraphs]
        .join(" ")
        .toLocaleLowerCase();
      return matchesCategory && searchableText.includes(query);
    });

    postGrid.replaceChildren();
    if (visiblePosts.length === 0) {
      const empty = document.createElement("p");
      empty.className = "blog-empty-state";
      empty.textContent = "No articles match that search. Try another word or choose a different topic.";
      postGrid.appendChild(empty);
    } else {
      visiblePosts.forEach((post) => postGrid.appendChild(makeCard(post)));
    }
    postCount.textContent = `${visiblePosts.length} ${visiblePosts.length === 1 ? "article" : "articles"}`;
  }

  function renderArticle(post) {
    blogContent.hidden = true;
    articleView.hidden = false;
    const back = document.createElement("a");
    back.className = "blog-article-back";
    back.href = "#blog";
    back.textContent = "← All articles";

    const cover = document.createElement("img");
    cover.className = "blog-article-cover";
    cover.src = post.image;
    cover.alt = post.alt;
    cover.fetchPriority = "high";
    cover.addEventListener("error", () => {
      cover.src = "assets/blog-placeholder.svg";
    }, { once: true });

    const meta = document.createElement("div");
    meta.className = "blog-article-meta";
    const category = document.createElement("strong");
    category.textContent = post.category;
    const time = document.createElement("span");
    time.textContent = post.time;
    meta.append(category, time);

    const title = document.createElement("h1");
    title.className = "blog-article-title";
    title.textContent = post.title;
    const intro = document.createElement("p");
    intro.className = "blog-article-intro";
    intro.textContent = post.summary;

    const body = document.createElement("div");
    body.className = "blog-article-body";
    post.paragraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      body.appendChild(paragraph);
    });
    const takeaway = document.createElement("div");
    takeaway.className = "blog-takeaway";
    const takeawayLabel = document.createElement("strong");
    takeawayLabel.textContent = "Try this";
    const takeawayText = document.createElement("span");
    takeawayText.textContent = post.takeaway;
    takeaway.append(takeawayLabel, takeawayText);
    body.appendChild(takeaway);

    const cta = document.createElement("aside");
    cta.className = "blog-article-cta";
    const ctaTitle = document.createElement("h2");
    ctaTitle.textContent = "Ready for your next step?";
    const ctaCopy = document.createElement("p");
    ctaCopy.textContent = "Find a learning path that fits your goals with S+ Academy.";
    const ctaLink = document.createElement("a");
    ctaLink.href = "test.html";
    ctaLink.textContent = "Check your English level";
    cta.append(ctaTitle, ctaCopy, ctaLink);

    articleView.replaceChildren(back, cover, meta, title, intro, body, cta);
    document.title = `${post.title} | S+ Academy Blog`;
  }

  function renderRoute() {
    const articlePrefix = "#blog/";
    const postSlug = window.location.hash.startsWith(articlePrefix)
      ? decodeURIComponent(window.location.hash.slice(articlePrefix.length))
      : "";
    if (postSlug) {
      const selectedPost = posts.find((post) => post.slug === postSlug);
      if (selectedPost) {
        renderArticle(selectedPost);
      } else {
        renderPosts();
        const empty = document.createElement("p");
        empty.className = "blog-empty-state";
        empty.textContent = "That article could not be found. Browse all of our English learning guides below.";
        postGrid.prepend(empty);
      }
      blogSection.scrollIntoView({ block: "start" });
      return;
    }

    renderPosts();
  }

  searchInput.addEventListener("input", renderPosts);
  categoryFilter.addEventListener("change", renderPosts);
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#blog" || window.location.hash.startsWith("#blog/")) {
      renderRoute();
    }
  });
  renderRoute();
})();
