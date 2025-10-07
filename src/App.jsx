import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Routes, Route, Link, useSearchParams, Outlet } from "react-router-dom";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q");   // ?q=hello
  const buldit = searchParams.get("buldit"); // ?page=2

  return (
    <div className="m-5">
      <h1>Search Page</h1>
      <p>Query: {query}</p>
      <p>Page: {buldit}</p>

      <button onClick={() => setSearchParams({ q: "react", buldit: 3 })}>
        Update Query
      </button>
    </div>
  );
}

function Fruit() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState();
  const [items, setItems] = useState(['Apple', 'Banana,', 'Kiwis']);
  const q = searchParams.get('q');

  const inputHandler = (e) => {
    setQuery(e.target.value);
  }

  const queryHandler = () => {
    setSearchParams({ q: query });
  }

  const filteredItems = items.filter(i => i.toLowerCase().includes((q || '').toLowerCase()));

  return (
    <>
      <input className="border m-5" value={query} onChange={inputHandler} />
      <button className="border p-2" onClick={queryHandler}>Search</button>
      <p className="m-5">Query - {query}</p>
      <p className="m-5">Q - {q}</p>
      {
        filteredItems.map(item => (
          <div className="m-5">
            <h1>{item}</h1>
          </div>
        ))
      }
    </>
  );
}

function RoutesForSearch() {
  return (
    <>
      <div className="flex gap-5 m-5">
        <Link to={'/?q=hello&buldit=3'}>Search</Link>
        <Link to={'/fruit'}>Fruit</Link>
      </div>

      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/fruit" element={<Fruit />} />
      </Routes>
    </>
  );
}

function Dashboard() {
  return (
    <>
      <div className="m-5">
        <h1>Dashboard Panel</h1>
        <Link to={'profile'}>Profile</Link>

        <Outlet />
      </div>
    </>
  );
}

function Profile() {
  return <h1 className="m-5">Profile</h1>
}

function NestedRoute() {
  return (
    <>
      <div className="m-5">
        <Link to={'/dashboard'}>Dashboard</Link>
      </div>

      <div>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

function HookForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const firstName = watch("firstName");

  const showData = (data) => {
    console.log(data);
  }

  return (
    <>
      <form onSubmit={handleSubmit(showData)}>
        <div className="flex flex-col m-5">
          <label>First name - {firstName}</label>
          <input {...register("firstName",
            {
              required: 'Name is required',
              minLength: { value: 3, message: 'Min character is 3' },
              maxLength: { value: 6, message: 'Max character is 6' }
            })}
            className="border" />
          {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}

          <label>Last Name</label>
          <input {...register('lastName')} className="border" />

          <button className="border p-2 mt-2">Submit</button>
        </div>
      </form>
    </>
  );
}

function TanstackGetAllAndPostAndDelete() {
  const queryClient = useQueryClient();
  const [id, setId] = useState(0);
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('https://localhost:7284/api/product', {
        method: 'GET'
      });

      return await response.json();
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId) => {
      await fetch(`https://localhost:7284/api/product/${productId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });

  if (isLoading) return <h2>Loading...</h2>;
  if (error) return <h2>Error fetching products</h2>;

  return (
    <>
      <h1>ID: {id}</h1>
      <div className="border p-5">
        {products.map((product) => (
          <>
            <h1>ID:{product.id}, Name: {product.name}, Price: {product.price}</h1>
            <button className="border p-2" onClick={() => setId(product.id)}>Get Data</button>
            <button className="border p-2" onClick={() => deleteProduct.mutate(product.id)}>Delete Data</button>
          </>
        ))}
      </div>
      {
        id == 0 ? <AddForm /> : <UpdateForm id={id} resetId={setId} />
      }
    </>
  );
}

function AddForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const addProduct = useMutation({
    mutationFn: async (newProduct) => {
      const response = await fetch('https://localhost:7284/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      return await response.json();
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(['products'], (oldData) => [...oldData, newData]);
    }
  });

  const addHandler = (data) => {
    addProduct.mutate(data);
    reset();
  }

  return (
    <>
      <div className="p-5">
        <form onSubmit={handleSubmit(addHandler)} className="flex gap-2">
          <label>ID</label>
          <input {...register('id')} className="border" />

          <label>Name</label>
          <input {...register('name')} className="border" />

          <label>Price</label>
          <input {...register('price')} className="border" />
          <button className="border p-1 cursor-pointer">Add</button>
        </form>
      </div>
    </>
  );
}

function UpdateForm({ id, resetId }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`https://localhost:7284/api/product/${id}`, {
        method: 'GET'
      });

      return await response.json();
    }
  });

  useEffect(() => {
    reset(product);
  }, [product]);

  const updateProduct = useMutation({
    mutationFn: async (newProduct) => {
      await fetch(`https://localhost:7284/api/product/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      resetId(0);
    }
  });

  const updateHandler = (data) => {
    updateProduct.mutate(data);
  }

  if (isLoading) return <h2>Loading...</h2>;
  if (error) return <h2>Error fetching products</h2>;

  return (
    <>
      <div className="p-5">
        <form onSubmit={handleSubmit(updateHandler)} className="flex gap-2">
          <label>ID</label>
          <input {...register('id')} className="border" />

          <label>Name</label>
          <input {...register('name')} className="border" />

          <label>Price</label>
          <input {...register('price')} className="border" />
          <button className="border p-1 cursor-pointer">Update</button>
        </form>
      </div>
    </>
  );
}

function Axios() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async function getProducts() {
      const response = await axios.get('https://localhost:7284/api/product');
      return await response.data;
    }
  });

  if (isLoading) return <h2>Loading...</h2>;
  if (error) return <h2>Error fetching products</h2>;

  return (
    <>
      <div className="border p-5">
        {products.map((product) => (
          <>
            <h1>ID:{product.id}, Name: {product.name}, Price: {product.price}</h1>
          </>
        ))}
      </div>
    </>
  );
}

function App() {


  return (
    <>
      <Axios />
    </>
  );
}

export default App;
