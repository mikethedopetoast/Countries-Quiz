'use strict';

// ---Set elements---

const elements = {
    title: document.getElementById('title'),
    navigation: document.getElementById('navigation-group'),
    navMin: document.getElementById('nav-min'),
    choicesGroup: document.getElementById('choices-group'),
    choice: document.getElementsByClassName('choice'),
    start: document.getElementById('start-btn'),
    instr: document.getElementById('instr-btn'),
    statusChange: document.getElementById('status-change'),
    quizCurrent: document.getElementById('current'),
    quizTotal: document.getElementById('total'),
    instruction: document.getElementById('instruction'),
    quizArea: document.getElementById('quiz-area'),
    messageArea: document.getElementById('message-area'),
    answerArea: document.getElementById('answer-area'),
    answerText: document.getElementById('answer-text'),
    answerSubmit: document.getElementById('answer-submit'),
    flag: document.getElementById('flag'),
    capital: document.getElementById('capital'),
    language: document.getElementById('language'),
    subregion: document.getElementById('subregion'),
    border: document.getElementById('border'),
}

// ---Set navigation bar---

elements.navMin.addEventListener('click', () => {
    elements.choicesGroup.classList.toggle('invisible');
    elements.choicesGroup.classList.contains('invisible') ?
    elements.navMin.textContent = 'Click to Show Continents' :
    elements.navMin.textContent = 'Click to Hide Continents'
})

// ---Set quiz defaults---

const forQuiz = {
    type: 'all',
    countries: null,
    current: 0,
    points: 0,
}

// ---Set 'continent' selection---

for (let choice of elements.choice) {
    choice.addEventListener('click', (e) => {
        // set styles for selected button and removed when the other button is selected
        for (let other of elements.choice) {
            other.classList.toggle('selected', other === choice && undefined)
        }
        // set quiz type based on selected continent
        forQuiz.type = e.target.dataset.continent;
    })
}

// ---Toggle 'All Countries' to change status---

elements.statusChange.addEventListener('click', (e) => {
    e.target.textContent === 'Independent' ? e.target.textContent = 'Dependent'
    : e.target.textContent === 'Dependent' ?  e.target.textContent = 'Combined'
    : e.target.textContent = 'Independent'
})

// ---Set the start button based on 'continent' and 'status' selections---

elements.start.addEventListener('click', async () => {
    const url = 'https://restcountries.com/v3.1/' + (forQuiz.type === 'all' ? 'all' : 'region/' + forQuiz.type);

    forQuiz.current = 0;
    forQuiz.points = 0;
    const quizType = forQuiz.type === 'all' ? 'world' : forQuiz.type;

    try {
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error('Request failed!')
        }

        // to filter countries independent status
        const jsonResponseFiltered = (await response.json()).filter(
            country => 
                elements.statusChange.textContent === 'Independent' ? country.independent
                : elements.statusChange.textContent === 'Combined' ? country
                : !country.independent
            );
        // to generate countries in random order
        forQuiz.countries = jsonResponseFiltered.sort(() => (Math.random() > .5) ? 1 : -1);
        
        // set 'Next' button
        elements.answerSubmit.addEventListener('click', toNext);
        document.body.addEventListener('keydown', enterToNext);
        // set changes to 'Title' and 'Answer Area'
        elements.answerArea.classList.remove('hidden');
        elements.title.innerHTML = `
            The <span id='chosen-type'>${quizType}</span> Quiz Started`;
        elements.quizTotal.innerText = forQuiz.countries.length;

        toRestart();
        setInfo();
      
    } catch (e) {
        console.log(e);
    }
})

// ---Set changes after clicking the start button---

function toRestart() {
    // 'Start' becomes 'Restart'
    elements.start.textContent = 'Restart';
    // instruction is hidden when the button is clicked
    elements.instruction.classList.add('hidden');
    // quiz area shows up after disabling instruction
    elements.quizArea.classList.add('active');
    // reset the current index to 0
    elements.quizCurrent.innerText = forQuiz.current;
    // reset the message area
    elements.messageArea.innerHTML = ''
}

// ---Set instruction page---

elements.instr.addEventListener('click', () => {
    elements.start.textContent = 'Start';
    elements.instruction.classList.remove('hidden');
    elements.quizArea.classList.remove('active');
    [elements.quizCurrent.innerText, elements.quizTotal.innerText] = Array(2).fill('0');
})

// ---Modify answers---

function isCountryEqual(country, str) {
    const toModify = (string) => {
        // to return unicode by replacing diacritics, empty space, parenthesis
        return string.toUpperCase()
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036f]|[\s]|[()]|[-]|[']/g, '')
    }

    // to return true if user's input matches the common, official
    // or at least one alternative name
    const isEqualToCommonName = toModify(str) === toModify(country.name.common);
    const isEqualToOfficialName = toModify(str) === toModify(country.name.official);
    const isEqualToAltNames = country.altSpellings.some(alt => toModify(str) === toModify(alt));

    return isEqualToCommonName || isEqualToOfficialName || isEqualToAltNames;
}

// ---Display the information of the current country---

function setInfo() {
    const curCountry = forQuiz.countries[forQuiz.current];
    
    // to check if no country is available for the quiz, e.g, 'Antarctica' does not contain 'Independent'
    if (!forQuiz.countries || forQuiz.countries.length === 0) {
        console.error('No countries data loaded or empty countries array.');
        elements.messageArea.innerHTML = `<p id='message'>Ops! No country is available for this category.</p>`;
        [elements.flag.src, elements.capital.innerText, elements.language.innerText, elements.subregion.innerText, elements.border.innerText] = Array(5).fill('-');
        return;
    // else if current country exceeds the total countries
    } else if (forQuiz.current < 0 || forQuiz.current >= forQuiz.countries.length) {
        console.error('Invalid current country index:', forQuiz.current);
        elements.messageArea.innerHTML = `<p id='message'>Quiz has ended.</p>`
        forQuiz.current = 0;
    // else if current country is undefined
    } else if (!curCountry) {
        console.error('Country data is undefined at index', forQuiz.current);
        elements.messageArea.innerHTML = `<p id='message'>Ops! No country is available.</p>`
        return;
    }
    
    elements.flag.src = curCountry.flags.png || '-';
    elements.capital.innerText = 
    // to check if the country is its own capital
        curCountry.capital && curCountry.capital[0] && isCountryEqual(curCountry, curCountry.capital[0]) 
        ? 'Is its own capital' 
        : (curCountry.capital ? curCountry.capital.join(', ') : '-');
    elements.language.innerText = curCountry.languages ? Object.values(curCountry.languages).join(', ') : '-';
    elements.subregion.innerText = curCountry.subregion || '-';
    elements.border.innerText = curCountry.borders ? curCountry.borders.join(', ') : '-';
}

// ---Set the 'Next' button with submit functionality---

function toNext() {
    const curCountry = forQuiz.countries[forQuiz.current];
    const quizType = forQuiz.type === 'all' ? 'world' : forQuiz.type;
    const sameName = curCountry.name.common === curCountry.name.official ? '' : curCountry.name.official + ',';

    // to check if the submitted answer aligns with the common, official or alternative names
    if (isCountryEqual(curCountry, elements.answerText.value)) {
        forQuiz.points++;
        elements.messageArea.innerHTML = `<p id='message'>Well done, you got it right!</p>`;
    } else {
        forQuiz.points;
        // to display official name only if it does not equal to its common name
        elements.messageArea.innerHTML = `
            <p id='message-title'>Oh No! These are the correct answers: </p>
            <p id='country-names'>${curCountry.name.common}, ${sameName} ${curCountry.altSpellings[0]}</p>`;
    }

    forQuiz.current++;
    elements.answerText.value = '';

    // to remove the message synchronously when the next set of information kicks in
    setTimeout(function() {
        elements.messageArea.innerHTML = ''
    }, 1200);

    // to count the score based on updated points and current country
    const score = `${forQuiz.points}/${forQuiz.countries.length}`;
    const percent = Math.floor((forQuiz.points / forQuiz.current) * 100);

    // to check if the quiz is finished
    if (forQuiz.current === forQuiz.countries.length) {
        // to remove the answer area and its functionality
        elements.answerSubmit.removeEventListener('click', toNext);
        document.body.removeEventListener('keydown', enterToNext);
        elements.answerArea.classList.add('hidden');
        elements.title.innerHTML = `
            The <span id='chosen-type'>${quizType}</span> Quiz Ended: <span id='score'>${score} = ${percent}%</span>`;
    } else {
        elements.answerArea.classList.remove('hidden');
        elements.title.innerHTML = `
            The <span id='chosen-type'>${quizType}</span> Quiz: <span id='score'>${score} = ${percent}%</span>`;
    }
    
    // to display the next set of information synchronously when the message is removed
    setTimeout(function() {
        setInfo();
    }, 1200);

    elements.quizCurrent.innerText = forQuiz.current;
}

function enterToNext(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        toNext();
    }
}