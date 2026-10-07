import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEventDetails } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event-details", `${id}`],
    queryFn: ({ signal }) => fetchEventDetails({ signal, id }),
    staleTime: 10000
  });

  const {
    mutate,
    isPending: isDeletionPending,
    isError: hasDeletionError,
    error: deletionError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      navigate("/events");
    },
  });

  function startDeleting() {
    setIsDeleting(true);
  }

  function stopDeleting() {
    setIsDeleting(false);
  }

  function deleteHandler() {
    mutate(id);
  }

  let formattedDate;

  if (data) {
    formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={stopDeleting}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            {isDeletionPending && <p>Deleting, please wait...</p>}
            {!isDeletionPending && (
              <>
                <button onClick={stopDeleting} className="button-text">
                  Cancel
                </button>
                <button onClick={deleteHandler} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {hasDeletionError && (
            <ErrorBlock
              title="Failed to delete event"
              message={
                deletionError.info?.message ||
                "Failed to delete event, please try again later."
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {isPending && (
          <div id="event-details-content" className="center">
            <p style={{ textAlign: "center" }}>Loading event details...</p>
          </div>
        )}
        {data && (
          <>
            <header>
              <h1>{data.title}</h1>
              <nav>
                <button onClick={startDeleting}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={`http://localhost:3000/${data.image}`}
                alt={data.title}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>
                    {formattedDate} @ {data.time}
                  </time>
                </div>
                <p id="event-details-description">{data.description}</p>
              </div>
            </div>
          </>
        )}
        {isError && (
          <div id="event-details-content">
            <ErrorBlock
              title={"An error occurred!"}
              message={
                error.info?.message ||
                `Could not fetch event details for id: ${data.id}`
              }
            />
          </div>
        )}
      </article>
    </>
  );
}
