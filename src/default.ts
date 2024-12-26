import { registerLicense } from "@syncfusion/ej2-base";
import { Gantt, Selection, Toolbar } from "@syncfusion/ej2-gantt";

/**
 * 1) Register your Syncfusion license key.
 *    (Replace "YOUR_LICENSE_KEY_STRING" with your actual key.)
 */
registerLicense("ORg4AjUWIQA/Gnt2XVhhQlJHfV5dX2dWfFN0QHNYflRxdV9FZUwgOX1dQl9nSHxRcERgWXxacnRcT2k=");

/**
 * Fetch tasks from the `tasks.json` file.
 */
async function fetchTasksJSON(): Promise<any[]> {
  const response = await fetch("./tasks.json");
  return response.json();
}

/**
 * Parse projectId from URL (?projectId=123).
 * Returns null if missing or invalid.
 */
function getProjectId(): number | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("projectId");
  if (!raw) return null; // no param
  const num = parseInt(raw, 10);
  return isNaN(num) ? null : num;
}

/**
 * Recursively filter tasks (and subtasks) by projectId.
 */
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

// 2) Inject Gantt modules: now includes Toolbar
Gantt.Inject(Selection, Toolbar);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // A) Check if a valid projectId is present
    const projectId = getProjectId();
    if (!projectId) {
      // If not, show an error message instead of the chart
      const container = document.getElementById("DefaultFunctionalities");
      if (container) {
        container.innerHTML =
          "<h3 style='color:red'>Error: Project ID missing. Please relaunch from your application.</h3>";
      }
      return; // Stop execution, don't load the Gantt
    }

    // B) Fetch the full set of tasks
    let allTasks = await fetchTasksJSON();

    // C) Filter tasks based on projectId
    allTasks = filterByProjectId(allTasks, projectId);

    // D) Create the Gantt instance with a toolbar
    const gantt = new Gantt({
      dataSource: allTasks,
      height: "450px",

      // Enable a built-in toolbar with whichever items you want
      toolbar: ["ExpandAll", "CollapseAll", "ExcelExport", "CsvExport"],

      // Handle toolbar button clicks (optional)
      toolbarClick: (args) => {
        console.log("Toolbar item clicked:", args.item.id);
        // e.g., if (args.item.id.includes("Export")) { /* custom logic */ }
      },

      // Standard Gantt field mappings
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

    // E) Render the Gantt inside your existing container
    gantt.appendTo("#DefaultFunctionalities");

    // F) Add a click listener for the "Settings" button (if you have one in your HTML)
    const settingsButton = document.getElementById("settings-btn");
    if (settingsButton) {
      settingsButton.addEventListener("click", () => {
        console.log("Settings button clicked. Show a sidebar or dialog here.");
        // e.g., open a custom sidebar, show a modal, etc.
      });
    }
  } catch (error) {
    console.error("Error loading Gantt tasks:", error);
  }
});
