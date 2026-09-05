import { processPendingJobs } from "../lib/services/ops-service";

processPendingJobs()
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
