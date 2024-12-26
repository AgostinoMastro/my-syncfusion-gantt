import { registerLicense } from "@syncfusion/ej2-base";
import { Gantt, Selection } from "@syncfusion/ej2-gantt";

// 1) Register your Syncfusion license key (replace with your actual key).
registerLicense("ORg4AjUWIQA/Gnt2XVhhQlJHfV5dX2dWfFN0QHNYflRxdV9FZUwgOX1dQl9nSHxRcERhWnpbcXJQRmQ=");

// 2) Function to fetch tasks from tasks.json in the same folder as index.html.
async function fetchTasksJSON(): Promise<any[]> {
  // This assumes tasks.json is deployed at the same level as index.html
  const response = await fetch("./tasks.json");
  return response.json();
}

// 3) Parse projectId from URL query parameters (e.g. ?projectId=123).
function getProjectId(): number | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("projectId");
  return raw ? parseInt(raw, 10) : null;
}

// 4) Filter tasks (and subtasks) by projectId (recursive).
function filterByProjectId(tasks: any[], projectId: number): any[] {
  return tasks
    .filter((task) => task.ProjectID === projectId)
    .map((task) => {
      if (task.subtasks) {
        task.subtasks = filterByProjectId(task.subtasks, projectId);
      }
      return task;
    });
}

// 5) Inject the Gantt modules (e.g., Selection).
Gantt.Inject(Selection);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // A) Fetch all tasks
    let allTasks = await fetchTasksJSON();

    // B) Check if we have ?projectId=XYZ
    const projectId = getProjectId();
    if (projectId) {
      allTasks = filterByProjectId(allTasks, projectId);
    }

    // C) Create and configure the Gantt
    const gantt: Gantt = new Gantt({
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
        child: "subtasks",
      },
      treeColumnIndex: 1,
      columns: [
        { field: "TaskID", width: 80 },
        { field: "TaskName", headerText: "Task Name", width: 250 },
        { field: "StartDate" },
        { field: "EndDate" },
        { field: "Duration" },
        { field: "Predecessor" },
        { field: "Progress" },
      ],
      labelSettings: {
        leftLabel: "TaskName",
      },
      projectStartDate: new Date("03/24/2024"),
      projectEndDate: new Date("07/06/2024"),
    });

    // D) Append to DOM
    gantt.appendTo("#DefaultFunctionalities");
  } catch (error) {
    console.error("Error loading Gantt tasks:", error);
  }
});
