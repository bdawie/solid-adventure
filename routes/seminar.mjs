import fetch from "node-fetch";

import { Router } from 'express';

const router = Router();

const GET_URL =
  "https://doctoride-coding-test.ew.r.appspot.com/applicant/exercise/getList?apiKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2ViNjZjMGMyMWU3YTE2OWMzYjg3ZWUiLCJyb2xlIjoiYXBwbGljYW50IiwiaWF0IjoxNjc2MzcxNjQ4fQ.EWUiUx_I3AmWH6Pss3GxQCO19Os7ZYxmstcZYpkA2hs";
const POST_URL =
  "https://doctoride-coding-test.ew.r.appspot.com/applicant/exercise/sendResult?apiKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2ViNjZjMGMyMWU3YTE2OWMzYjg3ZWUiLCJyb2xlIjoiYXBwbGljYW50IiwiaWF0IjoxNjc2MzcxNjQ4fQ.EWUiUx_I3AmWH6Pss3GxQCO19Os7ZYxmstcZYpkA2hs";


// /seminar api endpoint
router.get("/", async (req, res) => {
    const listResponse = await fetch(GET_URL);
    const list = await listResponse.json();
  
    // create countries set and populate with countries
    const countries = new Set();
  
    list.partners.map((p) => {
      countries.add(p.country);
    });
  
    // create country-partners relation object
    const filteredPartners = {};
  
    // filter partners by conutry and populate the filteredPartners
    countries.forEach((country) => {
      filteredPartners[country] = list.partners.filter(
        (p) => p.country === country
      );
    });
  
    // a holder for the number of date occurence for each partner for each country and the linked attendees
    const countryDates = {};
  
    for (let country in filteredPartners) {
      // create empty array for pushing dates, thier counts and linked attendees.
      countryDates[country] = [];
  
      filteredPartners[country].map((partner) => {
        partner.availableDates.map((date) => {
          const countryDate = countryDates[country].find((cd) =>
            cd.date === date ? true : false
          );
  
          if (countryDate) {
            countryDate.count++;
            countryDate.attendees.push(partner);
          } else {
            countryDates[country].push({
              date,
              count: 1,
              attendees: [partner],
            });
          }
        });
      });
    }
  
    // result object
    let result = {
      countries: [],
    };
  
    // where the fun begins :) Find the earliest started day with the maximun number of attendees
    for (let country in countryDates) {
      // grab the first country date of each country and we assume it is the date with the max amount of attendees/occurence
      let maxCountryDate = countryDates[country][0];
  
      // vars for populating the result
      let startDate;
      let attendees;
      let attendeeCount;
      let name;
  
      // check whether the next date has more occurrences/attendees - if yes store it in the maxCountryDate
      for (let i = 1; i < countryDates[country].length; i++) {
        if (countryDates[country][i].count > maxCountryDate.count) {
          maxCountryDate = countryDates[country][i];
        }
      }
  
      // check for the other nearest date that has the same number of occurrences/attendees
      for (let i = 0; i < countryDates[country].length; i++) {
        if (
          countryDates[country][i].count === maxCountryDate.count &&
          countryDates[country][i].date !== maxCountryDate.date
        ) {
          // get the number of day and substract them
          const d1 = new Date(countryDates[country][i].date).getDay();
          const d2 = new Date(maxCountryDate.date).getDay();
  
          let diff = d1 - d2;
  
          // difference should be either 1 or -6 if d1 is the next date and d2 is the startDate 
          // -6 for saturdays and sundays - sunday is 0 and saturday is 6
          if (diff === 1 || diff === -6) {
            startDate = maxCountryDate.date;
            attendeeCount = maxCountryDate.count;
            attendees = maxCountryDate.attendees.map((att) => att.email);
            name = country;
            break;
          } // difference should be either -1 or 6 if d1 is the startDate and d2 is the next date
          else if (diff === -1 || diff === 6) {
            startDate = countryDates[country][i].date;
            attendeeCount = countryDates[country][i].count;
            attendees = countryDates[country][i].attendees.map(
              (att) => att.email
            );
            name = country;
            break;
          }
        }
      }
  
      // push the result
      result.countries.push({
        startDate,
        attendeeCount,
        attendees,
        name,
      });
    }
  
    // make the POST request to get the answer
    const fetchRes = await fetch(POST_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });
  
    if (fetchRes.status === 200) {
      res.json(result);
    } else {
      res.json({ error: { message: "bad logic..." } });
    }
  });
  

  export default router;