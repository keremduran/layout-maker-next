import React, { useState } from 'react';

const SetBold = (props) => {
  const [bolded, setBolded] = useState(false);

  const handleBoldText = () => {
    if (tableData.selectedCells.length > 0) {
      tableData.selectedCells.forEach((flatLocation) => {
        const [i, j] = flatLocation.split('-');
        boldText({ i, j });
      });
    } else boldText();
  };

  const boldText = ({ i, j } = props.location) => {
    const { children } = tableData.rows[i].cells[j];
    const newChildren = [];

    function removeBTags(htmlString) {
      return htmlString.replace(/<b>|<\/b>/g, '');
    }

    let cleanedHtml = removeBTags(children[0].html);

    const html = bolded ? cleanedHtml : `<b>${cleanedHtml}</b>`;
    setBolded((bolded) => !bolded);

    newChildren[0] = { html, text: children[0].text };
    tableData.rows[i].cells[j].children = newChildren;
    setTableData({ ...tableData });
  };
  return <button onClick={handleBoldText}>Set Bold</button>;
};

export default SetBold;
