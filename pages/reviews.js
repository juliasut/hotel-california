import styles from '@/styles/Reviews.module.css';
import { useState } from 'react';
import Layout from '@/components/Layout.user';
import prisma from '../lib/prisma';

export async function getServerSideProps(context) {
  const reviews = await prisma.review.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  // Had to do the json trick to get the date obj that is not serializable and will error out if not stringified
  return {
    props: {
      data: JSON.parse(JSON.stringify(reviews)),
    },
  };
}

export default function Review({ data }) {
  const [reviews, setReviews] = useState(data);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  async function saveReview(e) {
    e.preventDefault();
    const response = await fetch('/api/reviews/create', {
      body: JSON.stringify({
        // rating: +e.target.rating.value,
        rating: +rating,
        text: e.target.text.value,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'POST',
    });

    const review = await response.json();
    setReviews([review, ...reviews]);
    e.target.reset();
  }

  return (
    <Layout title="Hotel California | Leave A Review">
      <main>
        <div className={styles.auth}>
          <h1 style={{ fontFamily: "'Monoton', cursive", color: "white", fontSize: "300%" }}>
            Rate Us!
          </h1>
          <form onSubmit={saveReview}>
            <div>
              <div className="star-rating">
                {[...Array(5)].map((star, index) => {
                  index += 1;
                  return (
                    <button
                      type="button"
                      key={index}
                      className={
                        index <= (hover || rating) ? styles.on : styles.off
                      }
                      onClick={() => setRating(index)}
                      onMouseEnter={() => setHover(index)}
                      onMouseLeave={() => setHover(rating)}
                    >
                      <span className="star">&#9733;</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              {/* <label htmlFor="text">Your Review</label> */}
              <textarea
                id="text"
                name="text"
                autoFocus
                type="textarea"
                rows="5"
                placeholder="Your review here... 🏄"
                required
              />
            </div>
            <input type="submit" value="Post My Review" className="btn" />
          </form>
        </div>
        <section>
          {reviews?.map((item) => (
            <div key={item.id} className={styles.item}>
              <div>
                <div className={styles.rating}>rating: {item.rating}</div>
                <span
                  className={styles.rating}
                  style={{
                    fontFamily: "'Allison', cursive",
                    fontSize: '170%',
                    color: 'red',
                  }}
                >
                 by {item.user ? item.user.firstName : "Jennifer"} {item.user ? item.user.lastName : "Aniston"}
                </span>
                <div className={styles.rating}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div className={styles.rating}>{item.text}</div>
            </div>
          ))}
        </section>
      </main>
    </Layout>
  );
}
