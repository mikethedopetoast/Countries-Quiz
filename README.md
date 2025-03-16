# Countries Quiz - A trivia game to test your geographical knowledge 🌏

This project is deployed at the [link here.](https://countriesquizbymtdt.netlify.app/)

## Project Overview
How many countries can you name? Countries Quiz is a fun geography trivia game. To begin the quiz, a player can select a continent (default: World) and change the 'Independent' status. Flag and information of each country are retrieved from the REST Countries API, and questions are generated randomly for each round. Players can validate their answers and play as many times as they want. If you like Geography, this is the right game for you! 😉

## Project Highlights
### Normalize user's input to Unicode format
To remove any accents found in the input string (answer area), the **normalize()** method with its 'NFD' parameter assured the conversion of the string to a normalized Unicode format, deliberately turning the user's input accent-insensitive.

Having separated the base characters from the diacritical marks, I then used the **replaceAll()** method to remove them from the string. It is done through a **regex** to match the diacritical marks in the given Unicode range (u0300 to u036f) and replace them with empty strings.

For example, 'Saint Barthelemy' is now accepted as the correct answer on par with 'Saint Barthélemy'. The same notion applies to case-sensitive, space-sensitive, parentheses, dashes and apostrophes.
```
function isCountryEqual(country, str) {
    const toModify = (string) => {
        return string.toUpperCase()
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036f]|[\s]|[()]|[-]|['], '')
    }
...
```
When a user's input matches the common, official, or at least one of the alternative names from the API, the result will return True and the answer will be accepted as correct.
```
...
    const isEqualToCommonName = toModify(str) === toModify(country.name.common);
    const isEqualToOfficialName = toModify(str) === toModify(country.name.official);
    const isEqualToAltNames = country.altSpellings.some(alt => toModify(str) === toModify(alt));

    return isEqualToCommonName || isEqualToOfficialName || isEqualToAltNames;
}
```

### Style changes for selected and unselected buttons
When the user clicks any of the continents (elements.choice), the style would change for the selected button.

To remove the style when the other button is selected, iterate all buttons with **for...of**. The 'other' here indicates the non-selected buttons. Use **classList.toggle()** to retrieve the 'selected' class when clicking, and its second parameter determines whether the class is included. In this case, it would pick up the 'selected' class only if the 'other' strictly equals both clicked (choice) and didn't have the class yet (undefined).
```
for (let choice of elements.choice) {
    choice.addEventListener('click', (e) => {
        for (let other of elements.choice) {
            other.classList.toggle('selected', other === choice && undefined)
        }
        forQuiz.type = e.target.dataset.continent;
    })
}
```

### Retrieving country's information without error
Three conditions to check when setting up the country's information.
- No country is available for the quiz
- The current country exceeds the total countries (quiz ends)
- The current country is undefined.
```
if (!forQuiz.countries || forQuiz.countries.length === 0) {
    console.error('No countries data loaded or empty countries array.');
...
} else if (forQuiz.current < 0 || forQuiz.current >= forQuiz.countries.length) {
    console.error('Invalid current country index:', forQuiz.current);
...
} else if (!curCountry) {
    console.error('Country data is undefined at index', forQuiz.current);
...
}
```

Checking if the country has the same name as its capital through a **ternary operator**. Some dependent countries such as Macau do not have an official assigned capital, thus the API doesn't include the 'capital' array. If we retrieve the data without additional conditions, it might cause an error and crash the game. The existence of 'capital' and its first index are required. Then, the 'isCountryEqual' function could determine whether the country equals its capital, has a capital or doesn't.
```
function setInfo() {
    const curCountry = forQuiz.countries[forQuiz.current];
    ...
        curCountry.capital && curCountry.capital[0] && isCountryEqual(curCountry, curCountry.capital[0]) 
        ? 'Is its own capital' 
        : (curCountry.capital ? curCountry.capital.join(', ') : '-');
}
```

### Resources
- [Remove Accents by Github user: Chalarangelo](https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets/js/s/remove-accents.md)
- [DOMTokenList: toggle() method by MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle)
- [Remove Class when another button with same class is clicked by Stackoverflow user: trincot](https://stackoverflow.com/a/75705538/20055605)

