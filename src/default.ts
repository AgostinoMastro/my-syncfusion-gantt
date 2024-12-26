import { registerLicense } from "@syncfusion/ej2-base";
import { Gantt, Selection } from "@syncfusion/ej2-gantt";

// Register your Syncfusion license key here
registerLicense("ORg4AjUWIQA/Gnt2XVhhQlJHfV5dX2dWfFN0QHNYflRxdV9FZUwgOX1dQl9nSHxRcERhWnpbcXJQRmQ=");

/**
 * Fetch tasks from `tasks.json`.
 */
async function fetchTasksJSON(): Promise<any[]> {
  const response = await fetch("./tasks.json");
  return response.json();
}

/**
 * Safely get a numeric projectId from the URL, or return null if invalid.
 */
function getProjectId(): number | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("projectId"); // e.g. "123" or "" or null
  if (!raw) {
    // If there's no param or it's empty string
    return null;
  }
  const num = parseInt(raw, 10);
  // If parseInt fails, num will be NaN => we treat that as invalid
  if (isNaN(num)) {
    return null;
  }
  return num;
}

/**
 * Recursively filter tasks (and subtasks) by projectId.
 */
function filterByProjectId(tasks: any[], projectId: number): any[] {
  return tasks
    .filter(task => task.ProjectID === projectId)
    .map(task => {
      if (Array.isArray(task.subtasks)) {
        task.subtasks = filterByProjectId(task.subtasks, projectId);
      }
      return task;
    });
}

// Inject Gantt modules
Gantt.Inject(Selection);

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Get a valid project ID (or null if missing/invalid)
  const projectId = getProjectId();

  // 2) If it's null (missing, empty, or invalid), don't show the chart
  if (projectId === null) {
    const container = document.getElementById("DefaultFunctionalities");
    if (container) {
      container.innerHTML = `
        <h3 style="color:red">
          Error: Project ID missing or invalid. Please relaunch from your application.
        </h3>`;
    }
    return; // Stop execution here
  }

  try {
    // 3) Fetch all tasks
    let allTasks = await fetchTasksJSON();

    // 4) Filter by this project ID
    allTasks = filterByProjectId(allTasks, projectId);

    // 5) Create Gantt
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

    // 6) Append to DOM
    gantt.appendTo("#DefaultFunctionalities");
  } catch (error) {
    console.error("Error loading tasks for project:", error);
  }
});
