const Home = () => {
  return (
    <div className="px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-5xl font-bold mb-5 text-slate-800">
        Welcome to Auth App
      </h1>
      <p className="mb-4 text-slate-700 text-2xl">
        This is a full-stack web application built with MERN (MongoDB, Express,
        React.js, Node.js) stack. It includes authentication features that
        allows user to sign up, login, update account, logout and provides
        access to protected routes only for authenticated users.
      </p>
      <p className="mb-4 text-slate-700 text-2xl">
        The frontend application is built with React.js with Redux features to
        implement global state along with react router for client side routing.
        The backend is built with Node.js and Express, and uses MongoDB as the
        database. Authenticaton is implemented using Json Web Token (JWT).
      </p>
      <p className="mb-4 text-slate-700 text-2xl">
        This application is intended to upgrade learning process with industry
        mentained code style and hands on with full stack authentication
        application with MERN stack.
      </p>
    </div>
  );
};

export default Home;
