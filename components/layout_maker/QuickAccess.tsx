import React from 'react';
import SetBold from './edit/SetBold';
import { SelectCells } from './edit/Selection';
import MergeCells from './edit/MergeCells';
import AddRemove from './edit/AddRemove';
type Props = {};

const QuickAccess = (props: any) => {
  //console.log(props);

  return (
    <div className='quick-access'>
      <h3>Quick access</h3>
      <span>
        <SetBold {...props} />
        <MergeCells />
      </span>

      <SelectCells location={props.location} />
      <AddRemove {...props} />
    </div>
  );
};

export default QuickAccess;
