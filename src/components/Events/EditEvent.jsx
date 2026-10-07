import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import {
  fetchEventDetails,
  queryClient,
  updateEventDetails,
} from "../../util/http.js";
//import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event-details", `${id}`],
    queryFn: ({ signal }) => fetchEventDetails({ signal, id }),
    staleTime: 5000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEventDetails,
  //   onMutate: async (data) => {
  //     await queryClient.cancelQueries({ queryKey: ["event-details", `${id}`] });
  //     const newEventData = data.event;
  //     const prevEventData = queryClient.getQueryData([
  //       "event-details",
  //       `${id}`,
  //     ]);
  //     queryClient.setQueryData(["event-details", `${id}`], newEventData);

  //     return { prevEventData };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(
  //       ["event-details", `${id}`],
  //       context.prevEventData
  //     );
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["event-details", `${id}`] });
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ id, event: formData });
    // navigate("../");
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  // if (isPending) {
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to fetch event details."
          message={
            error.info?.message ||
            "Failed to load event details for editting. Please try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          'Saving the changes...'
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["event-details", `${params.id}`],
    queryFn: ({ signal }) => fetchEventDetails({ signal, id: params.id }),
  });
}

export async function action({ request, params }) {
  const eventData = await request.formData();
  const newEventData = Object.fromEntries(eventData);
  const id = params.id;
  await updateEventDetails({ id, event: newEventData });
  await queryClient.invalidateQueries({ queryKey: ["event-details", `${id}`] });
  return redirect("../");
}
