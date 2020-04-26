import React from 'react';
import cards from '../node_modules/svg-cards/svg-cards.svg'


class HiddenSvgCardsComponent extends React.Component<{}, {}> {
  componentWillMount() {
    let fetchXML = (url: string, callback: (d: Document) => void) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function (evt) {
        if (xhr.readyState === 4 && xhr.responseXML != null) {
          callback(xhr.responseXML);
        }
      };
      xhr.send(null);
    };

    fetchXML(cards, function (svg) {
      var n = document.importNode(svg.documentElement, true);
      let cardsElement = document.getElementById("all_cards");
      if (cardsElement) {
        cardsElement.appendChild(n);
      }
    });
  }
   
  render() {
    return (
      <div style={{ display: "none" }}>
        <svg id="all_cards" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"></svg>
      </div> 
    );
  }
}

export default HiddenSvgCardsComponent;
