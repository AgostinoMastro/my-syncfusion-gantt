import { registerLicense } from "@syncfusion/ej2-base";
import { Gantt, Selection } from "@syncfusion/ej2-gantt";

// Register your Syncfusion license key (replace the placeholder)
registerLicense("YOUR_LICENSE_KEY_STRING");

/**
 * Fetch tasks from the `tasks.json` file.
 */
async function fetchTasksJSON(): Promise<any[]> {
  const response = await fetch("./tasks.json");
  return response.json();
}

/**
 * Parse projectId from URL (?projectId=123).
 */
function getProjectId(): number | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("projectId");
  return raw ? parseInt(raw, 10) : null;
}

/**
 * Recursively filter tasks (and subtasks) by projectId.
 */
function filterByProjectId(tasks: any[], projectId: number): any[] {
  return tasks
    .filter(task => task.ProjectID === projectId)
    .map(task => {
      if (task.subtasks) {
        task.subtasks = filterByProjectId(task.subtasks, projectId);
      }
      return task;
    });
}

// Inject the required Gantt modules.
Gantt.Inject(Selection);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1) Check if a valid projectId is present
    const projectId = getProjectId();
    if (!projectId) {
      // If not, show an error message in the container
      const container = document.getElementById("DefaultFunctionalities");
      if (container) {
        container.innerHTML =
          "<h3 style='color:red'>Error: Project ID missing. Please relaunch from your application</h3>";
      }
      return; // Stop execution, don't load the Gantt
    }

    // 2) Fetch the full set of tasks
    let allTasks = await fetchTasksJSON();

    // 3) Filter tasks based on projectId
    allTasks = filterByProjectId(allTasks, projectId);

    // 4) Create the Gantt instance
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

    // 5) Render the Gantt
    gantt.appendTo("#DefaultFunctionalities");
  } catch (error) {
    console.error("Error loading Gantt tasks:", error);
  }
});
