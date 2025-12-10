import React from "react";

const Blog: React.FC = () => {
  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-6">Blog da Pousada</h1>
      <p className="text-lg text-muted-foreground">
        Esta página listará os posts do blog.
      </p>
    </div>
  );
};

export default Blog;