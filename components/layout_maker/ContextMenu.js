import MiscEdit from './edit/MiscEdit';
import Selection, { SelectCells } from './edit/Selection';
import { useContextMenu } from '../../hooks';
import { tableDataContext } from '../App';
import { useContext, useRef } from 'react';

export const ContextMenu = ({ props }) => {
  const { tableData, setTableData } = useContext(tableDataContext);

  const contextMenuRef = useRef(null);

  const { setContextMenuVisible, contextMenuPosition } = props;

  let contextMenuStyle = {
    left: contextMenuPosition.i,
    top: contextMenuPosition.j,
  };

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

    const html = `<b>${cleanedHtml}</b>`;

    newChildren[0] = { html, text: children[0].text };
    tableData.rows[i].cells[j].children = newChildren;
    setTableData({ ...tableData });
  };

  useContextMenu(contextMenuRef, setContextMenuVisible);

  return (
    <div
      ref={contextMenuRef}
      style={{ ...contextMenuStyle }}
      className='context-menu'
    >
      <span className='quick-access'>
        <h3>Quick Access</h3>
        <SelectCells {...props} />
        <button onClick={handleBoldText}>Set Bold</button>
      </span>
      <Selection {...props} />
      <MiscEdit {...props} />
    </div>
  );
};
