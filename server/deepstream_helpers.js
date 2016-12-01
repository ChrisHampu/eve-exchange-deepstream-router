
export async function recordReady(record) {

  return new Promise((resolve, reject) => {

    if (!record) {
      resolve();
      return;
    }

    record.whenReady(record => {
      resolve();
    });
  });
}