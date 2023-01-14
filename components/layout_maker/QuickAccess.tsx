import React from 'react';
import SetBold from './edit/SetBold';
import Selection, { SelectCells } from './edit/Selection';
import MergeCells from './edit/MergeCells';
type Props = {};

const QuickAccess = (props: any) => {
  console.log(props);

  return (
    <div className='quick-access'>
      <h3>Quick access</h3>
      <SetBold {...props} />
      <MergeCells />
      <SelectCells location={props.location} />
    </div>
  );
};

export default QuickAccess;
