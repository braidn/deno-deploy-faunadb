import {
  json,
  serve,
  validateRequest,
} from "https://deno.land/x/sift@0.1.7/mod.ts";

serve({
  "/toys": handleRequest
});

enum Colors {
  GREEN,
  BLUE,
  BROWN,
  RED,
  ORANGE
}

enum Type {
  STUFFED,
  PLASTIC,
  WOODEN
}

interface Toy {
  _id?: string
  name: string
  mainColor: Colors
  description: string
  manufacterer: string
  type: Type
  error?: string
}

async function queryDB(
  query: string,
  variables: { [key: string]: unknown}
): Promise<{ data?: any, error?: any }> {
  const token = Deno.env.get("FAUNA_SECRET")
  if (!token) {
    throw new Error("Cannot reach database")
  }

  try {
    const res = await fetch("https://graphql.fauna.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({query, variables})
    })

    const { data, errors } = await res.json()

    if (errors) {
      return { data, error: errors[0] }
    }
    return { data }
  } catch (error) {
    return { error }
  }
}

async function handleRequest(request: Request) {
  const { error, body } = await validateRequest(request, {
    GET: {},
    POST: {
      body: ["name", "mainColor", "description", "manufacterer", "type"]
    }
  });

  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  if (request.method == "POST") {
    const { name, mainColor, description, manufacterer, type, _id, error } = await createToy(
      body as { name: Toy['name'], mainColor: Toy['mainColor'], description: Toy['description'], manufacterer: Toy['manufacterer'], type: Toy['type'] }
    )
    if (error) {
      return json({ error: "Unable to create toy"}, {status: 500})
    }

    return json({ _id, name, mainColor, description, manufacterer, type }, {status: 201})
  }

  {
    const { data, error } = await allToys()
    if (error) {
      return json({ error: 'unable to currently fetch toys' }, { status: 500 })
    }

    return json({data})
  }
}

async function createToy({
  name,
  mainColor,
  description,
  manufacterer,
  type
}: Toy): Promise<Toy> {
  const query = `
    mutation($name: String, $mainColor: ColorsList, $description: String, $manufacterer: String, $type: ToyType) {
      createToy(data: { name: $name, mainColor: $mainColor, description: $description, manufacterer: $manufacterer, type: $type }) {
        _id
        name
        mainColor
        description
        manufacterer
        type
      }
    }
  `
  const { data, error } = await queryDB(query, { name, mainColor, description, manufacterer, type })
  if (error) {
    return error
  }

  return data.createToy
}

async function allToys() {
  const query = `
    query {
      listToys {
        data {
          _id
          name
          mainColor
          description
          manufacterer
          type
        }
      }
    }
  `
  const { data: { listToys }, error } = await queryDB(query, {})
  if (error) {
    return error
  }

  return listToys
}
