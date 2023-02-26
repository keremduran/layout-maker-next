import { useContext, useState } from 'react';
import { tableDataContext } from '../../App';

const SetBold = (props) => {
  const [bolded, setBolded] = useState(false);
  const { tableData, setTableData } = useContext(tableDataContext);

  const handleBoldText = () => {
    if (tableData.selectedCells?.length > 0) {
      console.log(tableData.selectedCells);
      tableData.selectedCells.forEach((flatLocation) => {
        const [i, j] = flatLocation.split('-');
        boldText({ i, j });
      });
    } else boldText();

    setBolded((bolded) => !bolded);
  };

  const boldText = ({ i, j } = props.location) => {
    const { children } = tableData.rows[i].cells[j];
    const newChildren = [];

    function removeBTags(htmlString) {
      return htmlString.replace(/<b>|<\/b>/g, '');
    }

    let cleanedHtml = removeBTags(children[0].html);

    const html = bolded ? cleanedHtml : `<b>${cleanedHtml}</b>`;

    newChildren[0] = { html, text: children[0].text };
    tableData.rows[i].cells[j].children = newChildren;
    setTableData({ ...tableData });
  };
  return (
    <button className={bolded ? `active` : null} onClick={handleBoldText}>
      Bold
    </button>
  );
};

export default SetBold;
