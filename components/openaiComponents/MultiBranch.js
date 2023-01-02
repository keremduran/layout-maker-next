import Branch from './Branch';

// Multi-branch operations can be applied here.
const MultiBranch = ({ subTasks, id }) => {
  {
    return (
      subTasks &&
      subTasks.map((subTask, index) => {
        return (
          <Branch
            key={index}
            id={id + '' + (index + 1) + '.'}
            parentRef={{ task: subTask }}
          />
        );
      })
    );
  }
};

export default MultiBranch;
