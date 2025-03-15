# Countries Quiz - A trivia game to test your geographical knowledge 🌏

This project is deployed at the [link here.](https://countriesquizbymtdt.netlify.app/)

### Project Overview
How many countries can you name? Countries Quiz is a fun geography trivia game. To begin the quiz, a player can select a continent (default: World) and change the 'Independent' status. Flag and information of each country are retrieved from the REST Countries API, and questions are generated randomly for each round. Players can validate their answers and play as many times as they want. If you like Geography, this is the right game for you! 😉

### Project Highlights
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

### Resources
[Remove Accents by Github user: Chalarangelo](https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets/js/s/remove-accents.md)

