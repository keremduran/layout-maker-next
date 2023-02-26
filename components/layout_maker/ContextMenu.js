import MiscEdit from './edit/MiscEdit';
import Selection, { SelectCells } from './edit/Selection';
import { useContextMenu } from '../../hooks';
import { useRef } from 'react';
import QuickAccess from './QuickAccess';

export const ContextMenu = ({ props }) => {
  const contextMenuRef = useRef(null);

  const { setContextMenuVisible, contextMenuPosition } = props;

  let contextMenuStyle = {
    left: contextMenuPosition.i,
    top: contextMenuPosition.j,
  };

  useContextMenu(contextMenuRef, setContextMenuVisible);

  return (
    <div
      ref={contextMenuRef}
      style={{ ...contextMenuStyle }}
      className='context-menu'
    >
      <QuickAccess {...props} />
      <Selection {...props} />
      <MiscEdit {...props} />
    </div>
  );
};
