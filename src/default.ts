import { Gantt, Selection } from "@syncfusion/ej2-gantt";

/**
 * Fetch tasks from the `tasks.json` file 
 * (which will be served alongside the built files).
 */
async function fetchTasksJSON(): Promise<any[]> {
  // fetch('./tasks.json') means tasks.json is in same folder 
  // as index.html & bundle.js once deployed.
  const response = await fetch("./tasks.json");
  return response.json();
}

/**
 * Optional function to parse and filter tasks by project ID
 * if the user provides ?projectId=123 in the URL.
 */
function getProjectId(): number | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("projectId");
  return raw ? parseInt(raw, 10) : null;
}

/**
 * Filter tasks (and subtasks) by projectId.
 */
function filterByProjectId(tasks: any[], projectId: number) {
  return tasks
    .filter(t => t.ProjectID === projectId)
    .map(t => {
      if (t.subtasks) {
        t.subtasks = filterByProjectId(t.subtasks, projectId);
      }
      return t;
    });
}

Gantt.Inject(Selection);

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Read tasks from JSON
  let allTasks = await fetchTasksJSON();
  
  // 2) Check if we have ?projectId=XYZ
  const projectId = getProjectId();
  if (projectId) {
    allTasks = filterByProjectId(allTasks, projectId);
  }

  // 3) Create the Gantt
  const gantt = new Gantt({
    dataSource: allTasks,
    height: "450px",
    taskFields: {
      id: "TaskID",
      name: "TaskName",
      startDate: "StartDate",
      endDate: "EndDate",
      duration: "Duration",
      progress: "Progress",
      dependency: "Predecessor",
      child: "subtasks"
    },
    treeColumnIndex: 1,
    columns: [
      { field: "TaskID", width: 80 },
      { field: "TaskName", headerText: "Task Name", width: 250 },
      { field: "StartDate" },
      { field: "EndDate" },
      { field: "Duration" },
      { field: "Predecessor" },
      { field: "Progress" }
    ],
    labelSettings: {
      leftLabel: "TaskName"
    },
    projectStartDate: new Date("03/24/2024"),
    projectEndDate: new Date("07/06/2024")
  });

  // 4) Append to DOM
  gantt.appendTo("#DefaultFunctionalities");
});
