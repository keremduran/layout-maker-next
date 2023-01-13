import { tableDataContext } from '../App';
import { ContextMenu } from './ContextMenu';
import { useState, useEffect, useContext } from 'react';

export const Cell = ({ props }) => {
  let { location, styles, attributes, children } = props;
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const [cellText, setCellText] = useState(children[0].text);
  const [cellHtml, setCellHtml] = useState(children[0].html);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    i: 0,
    j: 0,
  });
  const { tableData, setTableData } = useContext(tableDataContext);
  const [selected, setSelected] = useState(false);
  const { editTextMode } = tableData.events;

  const handleRightClick = (e) => {
    e.preventDefault();
    setContextMenuVisible(true);
    setContextMenuPosition({ i: e.pageX, j: e.pageY });
  };

  useEffect(() => {
    const { selectedCells } = tableData;

    const { i, j } = location;
    const flatLocation = i + '-' + j;

    const isSelected =
      selectedCells && selectedCells.indexOf(flatLocation) !== -1;

    setSelected(isSelected);
  }, [tableData.selectedCells]);

  useEffect(() => {
    let currentCellText = '';
    let currentCellHtml = '';

    children.forEach((child) => {
      currentCellText += child.text;
      currentCellHtml += child.html;
    });

    setCellText(currentCellText);
    setCellHtml(currentCellHtml);
  }, [children]);

  const handleEditText = (e) => {
    let html = e.currentTarget.innerHTML;
    let text = e.currentTarget.textContent;
    const { i, j } = location;
    const children = tableData.rows[i].cells[j].children;
    children[0].html = html;
    children[0].text = text;
    //setTableData({ ...tableData });
  };

  const handleSelectCell = (e) => {
    if (e.button !== 0 || contextMenuVisible) return;
    setSelected((selected) => !selected);

    let selectedCells = tableData['selectedCells'];
    if (!selectedCells) selectedCells = [];

    const { i, j } = location;
    const locationValue = i + '-' + j;
    const foundIndex = selectedCells.indexOf(locationValue);

    if (!selected) selectedCells.push(locationValue);
    else selectedCells.splice(foundIndex, 1);

    setTableData({ ...tableData, selectedCells });
  };

  const handleSelect = (e) => {
    if (!tableData.events.editTextMode) handleSelectCell(e);
  };

  return (
    <td
      className={selected ? 'selected' : null}
      style={{ ...styles }}
      onMouseDownCapture={handleSelect}
      onContextMenu={!editTextMode ? handleRightClick : undefined}
      {...attributes}
    >
      <div
        className='cell-text'
        contentEditable={editTextMode}
        onInputCapture={handleEditText}
        dangerouslySetInnerHTML={{ __html: cellHtml }}
        style={!editTextMode ? { opacity: 0.5 } : null}
      ></div>

      {contextMenuVisible && (
        <ContextMenu
          props={{
            setContextMenuVisible,
            styles,
            location,
            contextMenuPosition,
          }}
        />
      )}
    </td>
  );
};
