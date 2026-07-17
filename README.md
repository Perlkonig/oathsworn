# Oathsworn Odds Information

Some basic information on the different dice used in Oathsworn, including a "Defence Calculator" that gives you the odds of rolling specific damage against a specific defence value.

Odds are computed exactly in the browser by enumerating every initial face combination and convolving crit-explosion probabilities for each dice pool (1–6 dice).

A live version is available at <https://perlkonig.com/oathsworn>.

## Viewing locally

Open [`oathsworn.html`](oathsworn.html) directly in a browser. No build step or web server is required.

## Legacy Monte Carlo generator

[`oathsworn.ts`](oathsworn.ts) is an optional legacy script that produced approximate odds via Monte Carlo simulation (`oathsworn.json`). It is no longer required; the HTML page computes exact probabilities on load.
