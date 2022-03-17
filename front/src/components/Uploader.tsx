import React from 'react'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { DashboardModal, DragDrop, useUppy } from '@uppy/react'


function Uploader() {
  const uppy = new Uppy({
    meta: { type: 'vid' },
    restrictions: { maxNumberOfFiles: 1 },
    autoProceed: true,
  })

  uppy.use(Tus, { endpoint: 'http://127.0.0.1:4000/vidupload/files/' })
  uppy.on('complete', (result) => {
    console.log('Upload complete! We’ve uploaded these files:', result.successful)
  })

  uppy.on('files-added', (files) => {
    console.log('Files added:', files)
  })
  return (
    <div>
      <DragDrop
        uppy={uppy}
        locale={{
          strings: {
            // Text to show on the droppable area.
            // `%{browse}` is replaced with a link that opens the system file selection dialog.
            dropHereOr: 'Drop here or %{browse}',
            // Used as the label for the link that opens the system file selection dialog.
            browse: 'browse',
          },
        }}
      />
    </div>
  );
};

// function Uploader() {
//   const uppy = useUppy(() => {
//     return new Uppy()
//       .use(Tus, { endpoint: 'http://localhost:4000/vidupload/files/' })
//       .on('files-added', (files) => {
//         console.log('Files added:', files)
//       })
//       .on('complete', (result) => {
//         console.log('Upload complete! We’ve uploaded these files:', result.successful)
//       })

//   })

//   return <DragDrop
//     width="100%"
//     height="100%"
//     note="Images up to 200×200px"
//     // assuming `this.uppy` contains an Uppy instance:
//     uppy={uppy}
//     locale={{
//       strings: {
//         // Text to show on the droppable area.
//         // `%{browse}` is replaced with a link that opens the system file selection dialog.
//         dropHereOr: 'Drop here or %{browse}',
//         // Used as the label for the link that opens the system file selection dialog.
//         browse: 'browse',
//       },
//     }}
//   />
// }


export default Uploader;