// تأكد إن الصفحة اتحملت
document.addEventListener("DOMContentLoaded", () => {
  // 1. القائمة الجانبية للموبايل
  const menuIcon = document.getElementById("menuIcon");
  const navLinks = document.getElementById("navLinks");
  if (menuIcon) {
    menuIcon.addEventListener("click", () =>
      navLinks.classList.toggle("active"),
    );
  }

  // 2. زر ابدأ الآن في الصفحة الرئيسية
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      notify({
        message: "جاري الانتقال للدرس الأول.. استعد! 🚀",
        type: "success",
      });
      setTimeout(() => {
        window.location.href = "pages/basics.html"; // تأكد من صحة المسار
      }, 1500);
    });
  }

  highlightJavaScriptCode();
});

function createTokenElement(tokenClass, tokenText) {
  const span = document.createElement("span");
  span.className = tokenClass;
  span.textContent = tokenText;
  return span;
}

function classifyJavaScriptToken(token) {
  if (token.startsWith("//")) return "code-comment";
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'")) ||
    (token.startsWith("`") && token.endsWith("`"))
  ) {
    return "code-string";
  }
  if (/^\d/.test(token)) return "code-number";
  if (
    /^(?:const|let|var|if|else|for|while|switch|case|break|continue|return|function|class|new|try|catch|finally|throw|typeof|instanceof|do|async|await|import|from|export|default|true|false|null|undefined)$/.test(
      token,
    )
  ) {
    return "code-keyword";
  }
  if (/^[A-Za-z_$][\w$]*\s*\($/.test(token)) return "code-function";
  if (/^(?:[+\-*=%!<>&|?:;,.(){}\[\]])$/.test(token)) return "code-operator";
  if (/^[A-Za-z_$][\w$]*$/.test(token)) return "code-variable";
  return "";
}

function highlightJavaScriptCode() {
  const blocks = document.querySelectorAll("pre code");

  blocks.forEach((block) => {
    if (
      block.dataset.syntaxHighlighted === "true" ||
      block.querySelector("span")
    ) {
      return;
    }

    const text = block.textContent.replace(/\u00A0/g, " ");
    const looksLikeJavaScript =
      block.classList.contains("language-javascript") ||
      block.classList.contains("language-js") ||
      /(?:^|\s)(const|let|var|if|else|for|while|switch|case|return|function|new|class|console\.|typeof|instanceof|try|catch|throw|await|async)(?=\s|\(|\.|$)/.test(
        text,
      ) ||
      /(?:\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b)/.test(text);

    if (
      !looksLikeJavaScript ||
      /<\s*\/?[a-zA-Z][^>]*>/.test(text) ||
      /&lt;/.test(text)
    ) {
      return;
    }

    const pattern =
      /\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|if|else|for|while|switch|case|break|continue|return|function|class|new|try|catch|finally|throw|typeof|instanceof|do|async|await|import|from|export|default|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*(?=\s*\()|\b[A-Za-z_$][\w$]*\b|[+\-*=%!<>&|?:;,.(){}\[\]]/gm;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, match.index)),
        );
      }

      const tokenText = match[0];
      const tokenClass = classifyJavaScriptToken(tokenText);

      if (tokenClass) {
        fragment.appendChild(createTokenElement(tokenClass, tokenText));
      } else {
        fragment.appendChild(document.createTextNode(tokenText));
      }

      lastIndex = match.index + tokenText.length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    block.textContent = "";
    block.appendChild(fragment);
    block.dataset.syntaxHighlighted = "true";
  });
}

/* ================================
   Notification Function
================================ */

function notify({ message = "", type = "info", duration = 3000 }) {
  const container = document.getElementById("notification-container");

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  notification.innerHTML = `
        <span class="icon">${icons[type]}</span>
        <span class="text">${message}</span>
        <button class="close-btn">✖</button>
    `;

  container.appendChild(notification);

  const closeBtn = notification.querySelector(".close-btn");

  const closeNotification = () => {
    notification.style.animation = "slideOut 0.4s ease forwards";
    setTimeout(() => notification.remove(), 400);
  };

  closeBtn.addEventListener("click", closeNotification);

  if (duration > 0) {
    setTimeout(closeNotification, duration);
  }
}

/* ================================
   التحكم في محتوى الدرس الأول
================================ */
function runDemo() {
  // استخدام دالتك بدلاً من alert
  notify({
    message: "أهلاً بك! هذا التنبيه يعمل بواسطة JavaScript.",
    type: "success",
    duration: 4000,
  });

  // إظهار النص المخفي في الصفحة
  const hiddenText = document.getElementById("demo-text");
  hiddenText.style.display = "block";
}

function runLesson2() {
  // 1. إخراج في الكونسول
  console.log("🎉 مبروك! إنت دلوقتي بتعرف تطلع بيانات في الـ Console");

  // 2. تنبيه باستخدام نظام التنبيهات بتاعك
  notify({
    message: "افتح الـ Console دلوقتي عشان تشوف المخرجات! (اضغط F12)",
    type: "info",
    duration: 5000,
  });
}

// 1. تجربة الـ Console
function testConsole() {
  console.log("🎉 رسالة سرية: أنت مبرمج رائع!");
  notify({
    message: "تمت الطباعة في الـ Console بنجاح! اضغط F12 لرؤيتها.",
    type: "info",
  });
}

// 2. تجربة الـ Alert
function testAlert() {
  alert("هذه نافذة Alert قديمة ومزعجة.. لاحظ أن الموقع توقف خلفها!");
  notify({
    message: "هل رأيت كيف توقف الموقع؟ هذا هو سبب تجنب Alert.",
    type: "warning",
  });
}

// 3. تجربة الـ Document Write
function testWrite() {
  // سنستخدم التنبيه هنا بدلاً من التنفيذ الفعلي لمنع مسح الصفحة التي تعبت في تصميمها!
  notify({
    message: "لو نفذنا document.write الآن، ستمسح كل التصميم! لذا هي ممنوعة.",
    type: "error",
  });
  console.warn("document.write() is prohibited in modern web apps.");
}

/* --- دوال الدرس الثالث --- */

// 1. محاكاة الأخطاء
function triggerError(type) {
  if (type === "syntax") {
    console.error("Uncaught SyntaxError: missing ) after argument list");
    notify({
      message: "❌ انظر للكونسول: هذا شكل Syntax Error",
      type: "error",
    });
  } else if (type === "ref") {
    console.error("Uncaught ReferenceError: x is not defined");
    notify({
      message: "❌ انظر للكونسول: المتغير غير موجود (Reference Error)",
      type: "error",
    });
  } else if (type === "type") {
    console.error("Uncaught TypeError: x is not a function");
    notify({
      message: "❌ انظر للكونسول: استخدام خاطئ للنوع (Type Error)",
      type: "error",
    });
  }
}

// 2. فحص الأنواع
function checkType(value) {
  let type = typeof value;
  let msg = `القيمة: ${value} <br> النوع: <strong>${type.toUpperCase()}</strong>`;

  // حالة خاصة للتفرقة بين الرقم والنص
  if (typeof value === "string" && !isNaN(value)) {
    msg += "<br>⚠️ (لاحظ أنه نص لأنه بين علامات تنصيص!)";
  }

  notify({ message: msg, type: "info", duration: 4000 });
}

// 3. اختبار المتغيرات
function testConst() {
  notify({
    message: "⛔ خطأ! لا يمكن تغيير قيمة const بعد تعريفها.",
    type: "error",
  });
  console.error("TypeError: Assignment to constant variable.");
}

function testLet() {
  let age = 20;
  age = 21; // تغيير القيمة
  notify({
    message: "✅ نجاح! تم تغيير القيمة من 20 إلى 21 لأننا نستخدم let.",
    type: "success",
  });
  console.log("New Age:", age);
}

// 4. تشغيل المثال الحي (Concatenation)
function runLiveDemo() {
  const name = "Eslam";
  const age = 21;
  const job = "Frontend Developer";

  // استخدام الطريقة الحديثة
  const message = `Card Details:
    👤 Name: ${name}
    🎂 Age: ${age}
    💻 Job: ${job}`;

  const outputBox = document.getElementById("demo-output");
  outputBox.style.display = "block";
  outputBox.innerText = message;
  outputBox.style.borderLeft = "5px solid #22c55e";

  notify({
    message: "تم إنشاء النص باستخدام Template Literals!",
    type: "success",
  });
}

// متغير عالمي لتخزين نوع العملية (عمر، درجة، أو حرارة)
let currentAction = "";

// 1. الدالة التي تفتح النافذة المخصصة
function openCustomModal(title, action) {
  currentAction = action;
  const inputField = document.getElementById("modalInput");

  // تحديد الحالات اللي محتاجة نصوص (حروف)
  const textActions = [
    "scopeTest",
    "returnVsLog",
    "callWithoutParentheses",
    "username",
    "traffic",
    "dayCheck",
    "switchChallenge",
    "continueTest",
    "whileFalseStart",
    "doWhileReason",
  ];

  if (textActions.includes(action)) {
    inputField.type = "text"; // تحويل الحقل لنص عشان يقبل حروف
    inputField.placeholder = "اكتب الإجابة هنا (نصوص)...";
  } else {
    inputField.type = "number"; // تحويل الحقل لرقم (للعمر والدرجات وتحدي الـ if)
    inputField.placeholder = "أدخل الرقم هنا...";
  }

  document.getElementById("modalTitle").innerText = title;
  // إخفاء صندوق الشرح عند فتح المودال من جديد
  //document.getElementById('modal-explain').style.display = "none";
  document.getElementById("customModal").style.display = "flex";
  inputField.value = "";
  inputField.focus();
}

// 2. الدالة التي تغلق النافذة
function closeModal() {
  document.getElementById("customModal").style.display = "none";
}

// 3. الدالة الموحدة لمعالجة البيانات عند الضغط على "تأكيد"
function submitModal() {
  const userInput = document.getElementById("modalInput").value;

  // 1. حالة فحص الـ Falsy (تسمح بمرور النص الفارغ للفحص)
  // حالة النصوص (إشارة المرور واليوم)
  if (
    currentAction === "scopeTest" ||
    currentAction === "returnVsLog" ||
    currentAction === "callWithoutParentheses" ||
    currentAction === "traffic" ||
    currentAction === "dayCheck" ||
    currentAction === "username" ||
    currentAction === "continueTest" ||
    currentAction === "whileFalseStart" ||
    currentAction === "doWhileReason"
  ) {
    closeModal();
    if (currentAction === "traffic") checkTrafficLogic(userInput);
    else if (currentAction === "dayCheck") checkDayLogic(userInput);
    else if (currentAction === "username") testUsernameLogic(userInput);
    else if (currentAction === "continueTest") handleContinueTest(userInput);
    else if (currentAction === "whileFalseStart")
      handleWhileFalseStart(userInput);
    else if (currentAction === "doWhileReason") handleDoWhileReason(userInput);
    else if (currentAction === "callWithoutParentheses")
      handleCallTest(userInput);
    else if (currentAction === "returnVsLog") handleReturnTest(userInput);
    else if (currentAction === "scopeTest") handleScopeTest(userInput);
    return; // ننهي الدالة هنا لهذه الحالة فقط
  }

  // 2. باقي الحالات (تتطلب إدخال قيمة ولا تقبل الفراغ)
  if (userInput === "") {
    notify({ message: "من فضلك أدخل القيمة أولاً!", type: "warning" });
    return;
  }

  const value = Number(userInput);
  closeModal(); // إغلاق النافذة بعد الحصول على الرقم

  // توجيه الرقم للدالة الصحيحة بناءً على نوع العملية
  if (currentAction === "age") checkAgeLogic(value);
  else if (currentAction === "score") checkScoreLogic(value);
  else if (currentAction === "temp") checkTempLogic(value);
  else if (currentAction === "challenge") checkChallengeLogic(value);
  else if (currentAction === "switchChallenge")
    checkSwitchChallengeLogic(userInput);
  // التوجيه بناءً على نوع الأكشن
  else if (currentAction === "loopEqualsTest") handleLoopEquals(value);
  else if (currentAction === "indexTest") handleIndexTest(value);
  else if (currentAction === "continueTest") handleContinueTest(value);
  // داخل دالة submitModal
  else if (currentAction === "finalLoopChallenge")
    handleFinalChallenge(userInput);
  // أضف هذه الحالات داخل دالة submitModal
  else if (currentAction === "whileFalseStart")
    handleWhileFalseStart(userInput); // نصي
  else if (currentAction === "doWhileReason")
    handleDoWhileReason(userInput); // نصي
  else if (currentAction === "whileCountTest") handleWhileCount(userInput);
  else if (currentAction === "doWhileAttemptsTest")
    handleDoWhileAttempts(userInput);
  else if (currentAction === "callWithoutParentheses") {
    handleCallTest(userInput);
  } else if (currentAction === "returnVsLog") {
    handleReturnTest(userInput);
  } else if (currentAction === "scopeTest") {
    handleScopeTest(userInput);
  }
}
/* --- الدوال المنطقية (Logic Functions) --- */

// فحص العمر
function checkAgeLogic(age) {
  if (age <= 0) {
    notify({
      message: "⚠️ هل أنت كائن فضائي؟ لا يوجد عمر بالسالب!",
      type: "warning",
    });
  } else if (age >= 18) {
    notify({
      message: `عمرك ${age}: أنت بالغ.. مسموح لك بالدخول ✅`,
      type: "success",
    });
  } else {
    notify({
      message: `عمرك ${age}: أنت لم تتجاوز سن البلوغ.. ممنوع الدخول ❌`,
      type: "error",
    });
  }
}

// فحص الدرجات
function checkScoreLogic(score) {
  if (score < 0 || score > 100) {
    notify({
      message: "❌ خطأ: الدرجة يجب أن تكون بين 0 و 100 فقط!",
      type: "error",
    });
  } else {
    let result = "";
    if (score >= 90) {
      result = "ممتاز 🏆";
    } else if (score >= 75) {
      result = "جيد جداً 🌟";
    } else if (score >= 60) {
      result = "جيد 👍";
    } else {
      result = "راسب 🫡";
    }

    notify({ message: `درجتك ${score}: تقديرك هو ${result}`, type: "info" });
  }
}

// فحص الحرارة
function checkTempLogic(temp) {
  if (temp < -50 || temp > 60) {
    notify({ message: "🌡️ درجة حرارة مستحيلة منطقياً!", type: "warning" });
  } else if (temp > 25) {
    notify({
      message: `الحرارة ${temp}: الجو حر.. خفف لبسك ☀️`,
      type: "warning",
    });
  } else if (temp >= 0 && temp <= 25) {
    notify({ message: `الحرارة ${temp}: الجو لطيف 🌤️`, type: "info" });
  } else {
    notify({
      message: `الحرارة ${temp}: الجو تحت الصفر.. تجمد! ❄️`,
      type: "error",
    });
  }
}

// دالة فحص القيم (Truthy & Falsy)
function testUsernameLogic(input) {
  let value;

  // تحويل المدخلات النصية إلى قيمها الحقيقية للفحص
  if (input.toLowerCase() === "false") value = false;
  else if (input.toLowerCase() === "null") value = null;
  else if (input.toLowerCase() === "undefined") value = undefined;
  else if (input.toLowerCase() === "nan") value = NaN;
  else if (input === "0") value = 0;
  else value = input; // النص العادي أو الفارغ

  // الفحص الجوهري (الجزء اللي بيشرح الدرس)
  if (value) {
    notify({
      message: `القيمة "${input}" تعتبر: <strong>True (Truthy) ✅</strong>`,
      type: "success",
    });
  } else {
    notify({
      message: `القيمة "${input === "" ? "فارغ" : input}" تعتبر: <strong>False (Falsy) ❌</strong>`,
      type: "error",
    });
  }
}

// 1. منطق إشارة المرور
function checkTrafficLogic(color) {
  const c = color.toLowerCase().trim();
  switch (c) {
    case "green":
      notify({ message: "🟢 انطلق (Green)", type: "success" });
      break;
    case "yellow":
      notify({ message: "🟡 استعد (Yellow)", type: "warning" });
      break;
    case "red":
      notify({ message: "🔴 توقف (Red)", type: "error" });
      break;
    default:
      notify({ message: "❓ لون غير معروف", type: "info" });
  }
}

// 2. منطق الأيام (تجميع الحالات)
function checkDayLogic(day) {
  const d = day.toLowerCase().trim();
  switch (d) {
    case "friday":
    case "saturday":
      notify({ message: "🎉 إجازة نهاية الأسبوع!", type: "success" });
      break;
    case "sunday":
    case "monday":
    case "tuesday":
    case "wednesday":
    case "thursday":
      notify({ message: "💼 يوم عمل رسمي", type: "info" });
      break;
    default:
      notify({ message: "❌ اسم يوم غير صحيح", type: "error" });
  }
}

// --- دالة منطق التحدي (المطورة مع الشرح) ---
function checkChallengeLogic(userAnswer) {
  const correctAnswer = 10;
  const explanationArea = document.getElementById("challengeExplanation");

  if (userAnswer === correctAnswer) {
    notify({
      message: "🎉 عبقري! إجابتك صحيحة تماماً.",
      type: "success",
    });
    // اختياري: إخفاء الشرح إذا كان ظاهراً من محاولة خاطئة سابقة
    explanationArea.style.display = "none";
  } else {
    // تجهيز نص الشرح بتنسيق HTML
    const explanationHTML = `
            <div class="error-header">❌ الإجابة "${userAnswer}" غير صحيحة!</div>
            <div class="correct-answer">الإجابة الصحيحة هي: (10)</div>
            <hr>
            <p><strong>ليه دي الإجابة الصح؟</strong></p>
            <ul>
                <li>خطوة 1: قيمة الطلب (100) ليست أكبر من (150) ← الشرط الأول فشل.</li>
                <li>خطوة 2: المتسخدم VIP فعلاً (isVip === true) ← الشرط الثاني تحقق.</li>
                <li>نتيجة: تم تحديد الخصم بـ 10 وتوقف البرنامج فوراً.</li>
            </ul>
        `;

    // إظهار الشرح في الصفحة
    explanationArea.innerHTML = explanationHTML;
    explanationArea.style.display = "block"; // يجعله يظهر في الصفحة

    notify({
      message: "❌ إجابة خطأ.. الشرح ظهر الآن تحت السؤال!",
      type: "error",
    });
  }
}

// --- دالة منطق تحدي الـ Switch ---
function checkSwitchChallengeLogic(userAnswer) {
  const correctAnswer = "ذهبي";
  const explanationArea = document.getElementById("switchChallengeExplanation");

  // تنظيف النص المدخل من المسافات
  const cleanedAnswer = userAnswer.trim();

  if (cleanedAnswer === correctAnswer) {
    notify({
      message: "🎯 أسطورة! إجابة صحيحة.. أنت فاهم المقارنة الصارمة صح.",
      type: "success",
    });
    explanationArea.style.display = "none";
  } else {
    const explanationHTML = `
            <div class="error-header" style="color: #3b82f6;">❌ الإجابة "${userAnswer}" غير دقيقة!</div>
            <div class="correct-answer">الإجابة الصحيحة هي: (ذهبي)</div>
            <hr style="border-color: rgba(59, 130, 246, 0.3);">
            <p><strong>ليه "ذهبي" مش "فضي"؟</strong></p>
            <ul>
                <li><strong>النوع يفرق:</strong> المتغير <code>rank</code> نوعه نص (String) لأنه بين علامات تنصيص "2".</li>
                <li><strong>المقارنة الصارمة:</strong> الـ Switch تستخدم <code>===</code>.</li>
                <li><strong>الحالة الأولى:</strong> كانت الرقم <code>2</code> (Number)، فرفضها البرنامج لأن النوع مختلف.</li>
                <li><strong>الحالة الثانية:</strong> كانت النص <code>"2"</code> (String)، فتطابقت تماماً وطلع الناتج "ذهبي".</li>
            </ul>
        `;

    explanationArea.innerHTML = explanationHTML;
    explanationArea.style.display = "block";

    notify({
      message: "❌ إجابة خطأ.. شوف الشرح بالتفصيل تحت السؤال!",
      type: "error",
    });
  }
}

// 1. اختبار العداد البسيط
function checkLoopCountLogic(userAnswer) {
  if (userAnswer === 3) {
    notify({
      message: "✅ صح! الحلقة هتدور للأرقام 0, 1, 2 (يعني 3 مرات).",
      type: "success",
    });
  } else {
    notify({
      message:
        "❌ خطأ. لو الشرط i < 3، يبقى هيقف لما يوصل لـ 3. (0, 1, 2) = 3 دورات.",
      type: "error",
    });
  }
}

// دالة مساعدة لإظهار الشرح الثابت
function showPersistentExplain(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `⚠️ <strong>توضيح:</strong> ${text}`;
    element.style.display = "block";
  }
}

// 1. دالة اختبار علامة التساوي
function handleLoopEquals(value) {
  if (parseInt(value) === 4) {
    notify({
      message: "برافو! بدون = الـ Loop هتقف عند 4 ومش هتوصل لـ 5.",
      type: "success",
    });
  } else {
    notify({ message: "إجابة خاطئة. راجع الشرح بالأسفل.", type: "error" });
    showPersistentExplain(
      "explain-loopEquals",
      "في لغة البرمجة، الشرط (i < 5) يعني أن الحلقة ستعمل طالما i هي 0, 1, 2, 3, 4 فقط. عند وصولها لـ 5، الشرط يصبح false وتتوقف فوراً.",
    );
  }
}

// 2. دالة اختبار الـ Index
function handleIndexTest(value) {
  if (parseInt(value) === 1) {
    notify({
      message: "صحيح! المصفوفة بتبدأ من 0، يبقى red=0 و green=1.",
      type: "success",
    });
  } else {
    notify({ message: "إجابة خاطئة. راجع الشرح بالأسفل.", type: "error" });
    showPersistentExplain(
      "explain-indexTest",
      "المصفوفات في JavaScript تبدأ دائماً من الرقم (0). العنصر الأول ['red'] مكانه 0، والعنصر الثاني ['green'] مكانه 1.",
    );
  }
}

// 3. دالة اختبار Continue
function handleContinueTest(value) {
  const answer = value.toLowerCase();
  if (answer === "لا" || answer === "no") {
    notify({
      message:
        "إجابة ممتازة! continue خلت الـ Loop تهرب من رقم 3 وتكمل للي بعده.",
      type: "success",
    });
  } else {
    notify({ message: "إجابة خاطئة. راجع الشرح بالأسفل.", type: "error" });
    showPersistentExplain(
      "explain-continueTest",
      "وظيفة كلمة continue هي القفز فوق الدورة الحالية. عندما كانت i تساوي 3، أمرنا الـ Loop بأن تتخطى الكود وتذهب للرقم 4 مباشرة، لذا رقم 3 لن يُطبع أبداً.",
    );
  }
}

function handleFinalChallenge(value) {
  const explainDiv = document.getElementById("explain-finalChallenge");

  // إغلاق المودال فوراً كما طلبت
  closeModal();

  if (parseInt(value) === 9) {
    notify({
      message: "🎉 ممتاز! إجابة صحيحة، الناتج هو 9 فعلاً.",
      type: "success",
    });
    explainDiv.style.display = "none"; // إخفاء الشرح لو كان موجوداً
  } else {
    notify({
      message: "إجابة خاطئة، اقرأ الشرح الذي ظهر تحت الزرار.",
      type: "error",
    });

    // إظهار الشرح تحت الزرار في الصفحة الرئيسية
    explainDiv.innerHTML = `⚠️ <strong>توضيح التحدي:</strong> المصفوفة تحتوي على [1, 2, 3, 4, 5]. الكود يستخدم شرط <code>if (numbers[i] % 2 === 0)</code> لتحديد الأرقام الزوجية (2 و 4) ثم ينفذ <code>continue</code> لتخطيها. لذلك، تم جمع الأرقام الفردية فقط: 1 + 3 + 5 = 9.`;
    explainDiv.style.display = "block";
    explainDiv.style.color = "#f59e0b";
  }
}

// 1. معالجة فهم while
function handleWhileFalseStart(value) {
  closeModal();
  const explainDiv = document.getElementById("explain-whileFalseStart");
  const answer = value.trim();

  if (
    answer.includes("لا تعمل") ||
    answer.includes("لن تعمل") ||
    answer.includes("0")
  ) {
    notify({
      message: "برافو! فعلاً while حذرة جداً ولن تبدأ أبداً.",
      type: "success",
    });
    explainDiv.style.display = "none";
  } else {
    notify({ message: "إجابة خاطئة. اقرأ التوضيح بالأسفل.", type: "error" });
    showPersistentExplain(
      "explain-whileFalseStart",
      "في جملة while، يتم فحص الشرط 'قبل' الدخول. فإذا كان الشرط (100 < 10) خطأ، المتصفح يتخطى الـ Loop بالكامل ولا ينفذ ما بداخلها ولو لمرة واحدة.",
    );
    explainDiv.style.display = "block";
  }
}

// 2. معالجة سبب تسمية do-while
function handleDoWhileReason(value) {
  closeModal();
  const explainDiv = document.getElementById("explain-doWhileReason");

  if (value.includes("تنفذ ثم تفكر")) {
    notify({ message: "ممتاز! وصف دقيق جداً للمتهور.", type: "success" });
    explainDiv.style.display = "none";
  } else {
    notify({ message: "إجابة غير دقيقة.", type: "error" });
    showPersistentExplain(
      "explain-doWhileReason",
      "تسمى متهورة لأنها تدخل لتنفيذ الأوامر داخل بلوك الـ do 'قبل' أن تنظر إلى الشرط الموجود في الـ while، وهذا يضمن تنفيذ الكود مرة واحدة على الأقل.",
    );
    explainDiv.style.display = "block";
  }
}

function handleWhileCount(value) {
  closeModal();
  const explainDiv = document.getElementById("explain-whileCountTest");
  if (parseInt(value) === 3) {
    notify({
      message: "صح! x زادت (4، 7، 10) فتوقفت اللوب بعد 3 مرات.",
      type: "success",
    });
    explainDiv.style.display = "none";
  } else {
    notify({ message: "خطأ، تتبع حركة x بعناية!", type: "error" });
    showPersistentExplain(
      "explain-whileCountTest",
      " x بدأت بـ 1. المرة الأولى أصبحت 4، الثانية 7، الثالثة 10. عند 10 الشرط (10 < 10) كسر اللوب، فكان المجموع 3 دورات.",
    );
  }
}

function handleDoWhileAttempts(value) {
  closeModal();
  const explainDiv = document.getElementById("explain-doWhileAttemptsTest");
  if (parseInt(value) === 1) {
    notify({
      message: "عبقري! لاحظت أن اللوب نفذت مرة واحدة رغم خطأ الشرط.",
      type: "success",
    });
    explainDiv.style.display = "none";
  } else {
    notify({
      message: "إجابة خاطئة. تذكر أن الـ do...while متهورة!",
      type: "error",
    });
    showPersistentExplain(
      "explain-doWhileAttemptsTest",
      " بما أنها do...while، الكود نُفذ أولاً فزادت attempts لـ 1، ثم فحص الشرط (5 > 10) فوجده خطأ فتوقف، لكن بعد أن نُفذت المرة الأولى حتماً.",
    );
  }
}

// الدوال المعالجة
function handleCallTest(value) {
  closeModal();
  const explainDiv = document.getElementById("explain-callWithoutParentheses");
  if (value.includes("لا تعمل") || value.includes("كود الدالة")) {
    notify({
      message: "برافو! أنت تشير للدالة فقط ولا تشغلها.",
      type: "success",
    });
    explainDiv.style.display = "none";
  } else {
    notify({ message: "إجابة خاطئة!", type: "error" });

    const explainDiv = document.getElementById(
      "explain-callWithoutParentheses",
    );

    explainDiv.innerHTML = `<strong>⚠️ توضيح:</strong> بدون ()، المتصفح سيعطيك 'وصف' الدالة وكودها المكتوب، لكنه لن ينفذ الأوامر التي بداخلها.`;

    explainDiv.style.display = "block";
  }
}

function handleReturnTest(value) {
  closeModal();
  const explainDiv = document.getElementById("explain-returnVsLog");
  if (value.toLowerCase().includes("return")) {
    notify({
      message:
        "ممتاز! return هي الطريقة الوحيدة لاستخراج قيمة للاستخدام لاحقاً.",
      type: "success",
    });
    explainDiv.style.display = "none";
  } else {
    notify({ message: "راجع الفرق بين return و log!", type: "error" });

    const explainDiv = document.getElementById("explain-returnVsLog");

    explainDiv.innerHTML = `<strong>⚠️ توضيح:</strong> تذكر أن console.log هي مجرد 'عرض' على الشاشة. أما return فهي 'تسليم' النتيجة للكود ليخزنها ويستخدمها في عمليات أخرى.`;

    explainDiv.style.display = "block";
  }
}

function handleScopeTest(value) {
  closeModal();
  const explainDiv = document.getElementById("explain-scopeTest");
  if (value.includes("لا") || value.includes("خطأ")) {
    notify({
      message: "صحيح! المتغيرات المحلية محبوسة داخل دالتها.",
      type: "success",
    });
    explainDiv.style.display = "none";
  } else {
    notify({ message: "إجابة خاطئة، انتبه للنطاق!", type: "error" });

    const explainDiv = document.getElementById("explain-scopeTest");

    explainDiv.innerHTML = `<strong>⚠️ توضيح:</strong> المتغير المعرف داخل دالة يمتلك Local Scope، أي أنه "محبوس" بداخلها وغير موجود بالنسبة لأي مكان خارج هذه الدالة.`;

    explainDiv.style.display = "block";
  }
}

function checkFunctionQuiz() {
  const input = document.querySelector("#quiz-input").value.replace(/\s/g, ""); // حذف المسافات للتحقق
  const explainDiv = document.getElementById("quiz-explain");

  // إجابات محتملة صحيحة (Arrow Function)
  const correctAnswer1 = "constgetDiscount=(price)=>price*0.8;";
  const correctAnswer2 = "constgetDiscount=price=>price*0.8;";
  const correctAnswer3 = "constgetDiscount=(price)=>{returnprice*0.8;};";

  if (
    input.includes("price*0.8") &&
    input.includes("=>") &&
    input.includes("getDiscount")
  ) {
    notify({ message: "عبقري! إجابة نموذجية 🚀", type: "success" });
    explainDiv.style.display = "none";
  } else {
    notify({ message: "حاول مرة أخرى! ركز في الصياغة", type: "error" });
    explainDiv.innerHTML = `
            <strong>💡 تلميح الحل:</strong><br>
            استخدم ;<code>const getDiscount = (price) => price * 0.8</code><br>
            ضرب السعر في 0.8 هو أسرع طريقة لحساب السعر بعد خصم 20%.
        `;
    explainDiv.style.display = "block";
  }
}

// User Eslam is 21 years old and works as FRONTEND DEVELOPER.
// String

function checkStringQuiz() {
  // نستخدم الـ IDs الجديدة لضمان عدم التداخل
  const inputField = document.querySelector("#string-quiz-input");
  const explainDiv = document.getElementById("string-quiz-explain");

  // تنظيف النص من أي مسافات زائدة أو سطور خفية
  const userValue = inputField.value.trim().replace(/\s+/g, " ");

  // النص المطلوب بالضبط (بدون مسافات السطر الجديد)
  const correctResult =
    "User Eslam is 21 years old and works as FRONTEND DEVELOPER.";

  if (userValue === correctResult) {
    notify({ message: "عبقري! إجابة نموذجية 🚀", type: "success" });
    explainDiv.style.setProperty("display", "none", "important");
  } else {
    notify({
      message: "حاول مرة أخرى! تأكد من الحروف الكبيرة والنقطة",
      type: "error",
    });

    // إظهار صندوق الشرح بقوة الـ !important
    explainDiv.style.setProperty("display", "block", "important");
    explainDiv.innerHTML = `
            <div class="info-box bold-text" style="border-right: 4px solid #ef4444; background: rgba(239, 68, 68, 0.1); padding: 15px;">
                <strong>💡 النتيجة المتوقعة هي:</strong> 
                <code style="background: #1e293b; color: #6366f1; display: block; margin-top: 10px; padding: 10px; border-radius: 5px;">User Eslam is 21 years old and works as FRONTEND DEVELOPER.</code>
            </div>`;
  }
}

function checkJsonQuizUnique() {
  // تنظيف الإدخال
  const input = document
    .getElementById("json-quiz-input-unique")
    .value.replace(/\s+/g, "")
    .toLowerCase();
  const explainDiv = document.getElementById("json-quiz-explain-unique");

  // الإجابات المقبولة
  const validAnswers = [
    "consttext=json.stringify(user);",
    "lettext=json.stringify(user);",
    "vartext=json.stringify(user);",
    "text=json.stringify(user);",
  ];

  if (validAnswers.some((ans) => input.includes(ans))) {
    notify({ message: "ممتاز! إجابة صحيحة 🚀", type: "success" });
    explainDiv.style.setProperty("display", "none", "important");
  } else {
    notify({
      message: "حاول مرة أخرى! تذكر دالة JSON.stringify",
      type: "error",
    });
    explainDiv.style.setProperty("display", "block", "important");
    explainDiv.innerHTML = `
                <div class="info-box bold-text" style="border-right: 4px solid #ef4444; background: rgba(239, 68, 68, 0.1);">
                    <strong>💡 الحل الصحيح:</strong> 
                    <p dir="ltr" style="text-align: left; margin-top: 5px; color: #6366f1;">
                        const text = JSON.stringify(user);
                    </p>
                </div>`;
  }
}
