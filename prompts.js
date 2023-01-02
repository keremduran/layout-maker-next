export const getSplitTasksPrompt = (rootState = null) => {
  const fullList = rootState ? JSON.stringify(rootState) : 'full list.';

  const prefix = `
    This is the task list: 
    '${fullList}'
  
    This is the node I want to update:
    `;

  const postfix = `This is the request for you to accomplish:
    Split the task into subtasks in a way that every subtask can be accomplished by openai API.
    Do not prompt everything only prompt the new subtasks. 
    Do not prefix the new sublist with 'Updated Node: ' etc.
    Do not number or prefix any new line.`;

  return { prefix, postfix };
};

function removeIdPrefix(string, id) {
  const regex = new RegExp(`^${id}\\S*`);
  return string.replace(regex, '');
}

export const splitTextToSubTasks = (text, parentId = '') =>
  text
    .split(/\r\n|\n\r|\n|\r/)
    .filter((subTask) => subTask.length > 2)
    .map((subTask, index) => {
      const id = parentId + (index + 1) + '.';
      return {
        task: removeIdPrefix(subTask, id),
        id: parentId + (index + 1) + '.',
      };
    });
