const db = require('../config/database');
const logger = require('../utils/logger');

// Get active voting
exports.getActiveVoting = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        v.*,
        json_agg(
          json_build_object(
            'id', vo.id,
            'project', json_build_object(
              'id', p.id,
              'title', p.title,
              'description', p.description,
              'goal_amount', p.goal_amount,
              'image_url', p.image_url
            ),
            'votes_count', vo.votes_count
          )
        ) as options
      FROM votings v
      LEFT JOIN voting_options vo ON v.id = vo.voting_id
      LEFT JOIN projects p ON vo.project_id = p.id
      WHERE v.status = 'active'
        AND v.start_date <= CURRENT_TIMESTAMP
        AND v.end_date >= CURRENT_TIMESTAMP
      GROUP BY v.id
      ORDER BY v.created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.json({ 
        voting: null, 
        message: 'No active voting at the moment' 
      });
    }

    const voting = result.rows[0];
    
    // Calculate percentages
    const totalVotes = voting.options.reduce((sum, opt) => sum + opt.votes_count, 0);
    voting.options = voting.options.map(opt => ({
      ...opt,
      percentage: totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0
    }));
    
    voting.total_votes = totalVotes;

    res.json({ voting });
  } catch (error) {
    logger.error('Error fetching active voting:', error);
    res.status(500).json({ error: 'Failed to fetch active voting' });
  }
};

// Create new voting (ADMIN)
exports.createVoting = async (req, res) => {
  const { title, description, start_date, end_date, project_ids } = req.body;

  try {
    // Validation
    if (!title || !start_date || !end_date || !project_ids || project_ids.length < 2) {
      return res.status(400).json({ 
        error: 'Title, dates, and at least 2 projects are required' 
      });
    }

    if (project_ids.length > 5) {
      return res.status(400).json({ 
        error: 'Maximum 5 projects allowed per voting' 
      });
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ 
        error: 'End date must be after start date' 
      });
    }

    // Create voting and options in transaction
    const result = await db.transaction(async (client) => {
      // Create voting
      const votingResult = await client.query(`
        INSERT INTO votings (title, description, start_date, end_date, status, created_by)
        VALUES ($1, $2, $3, $4, 'upcoming', $5)
        RETURNING *
      `, [title, description, start_date, end_date, req.user.id]);

      const voting = votingResult.rows[0];

      // Create voting options
      for (const projectId of project_ids) {
        await client.query(`
          INSERT INTO voting_options (voting_id, project_id)
          VALUES ($1, $2)
        `, [voting.id, projectId]);
      }

      return voting;
    });

    logger.info(`Voting created: ${result.id} by admin ${req.user.id}`);
    res.status(201).json({ 
      message: 'Voting created successfully', 
      voting: result 
    });

  } catch (error) {
    logger.error('Error creating voting:', error);
    res.status(500).json({ error: 'Failed to create voting' });
  }
};

// Cast a vote (USER)
exports.castVote = async (req, res) => {
  const { id: votingId } = req.params;
  const { option_id } = req.body;
  const userId = req.user.id;

  try {
    // Check if voting exists and is active
    const votingCheck = await db.query(`
      SELECT * FROM votings
      WHERE id = $1
        AND status = 'active'
        AND start_date <= CURRENT_TIMESTAMP
        AND end_date >= CURRENT_TIMESTAMP
    `, [votingId]);

    if (votingCheck.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Voting is not active or does not exist' 
      });
    }

    // Check if user already voted
    const voteCheck = await db.query(`
      SELECT * FROM user_votes
      WHERE user_id = $1 AND voting_id = $2
    `, [userId, votingId]);

    if (voteCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You have already voted in this voting' 
      });
    }

    // Verify option belongs to this voting
    const optionCheck = await db.query(`
      SELECT * FROM voting_options
      WHERE id = $1 AND voting_id = $2
    `, [option_id, votingId]);

    if (optionCheck.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid voting option' 
      });
    }

    // Record vote in transaction
    await db.transaction(async (client) => {
      // Insert user vote
      await client.query(`
        INSERT INTO user_votes (user_id, voting_id, option_id)
        VALUES ($1, $2, $3)
      `, [userId, votingId, option_id]);

      // Increment vote count
      await client.query(`
        UPDATE voting_options
        SET votes_count = votes_count + 1
        WHERE id = $1
      `, [option_id]);
    });

    logger.info(`User ${userId} voted for option ${option_id} in voting ${votingId}`);
    res.json({ 
      message: 'Vote recorded successfully',
      voted_at: new Date()
    });

  } catch (error) {
    logger.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
};

// Get voting results
exports.getVotingResults = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        v.*,
        json_agg(
          json_build_object(
            'id', vo.id,
            'project', json_build_object(
              'id', p.id,
              'title', p.title,
              'description', p.description,
              'image_url', p.image_url
            ),
            'votes_count', vo.votes_count
          ) ORDER BY vo.votes_count DESC
        ) as options
      FROM votings v
      LEFT JOIN voting_options vo ON v.id = vo.voting_id
      LEFT JOIN projects p ON vo.project_id = p.id
      WHERE v.id = $1
      GROUP BY v.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voting not found' });
    }

    const voting = result.rows[0];
    const totalVotes = voting.options.reduce((sum, opt) => sum + opt.votes_count, 0);
    
    voting.options = voting.options.map(opt => ({
      ...opt,
      percentage: totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0
    }));
    
    voting.total_votes = totalVotes;
    voting.winner = voting.options[0]; // First option (highest votes)

    res.json({ voting });
  } catch (error) {
    logger.error('Error fetching voting results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

// Get all votings (ADMIN)
exports.getAllVotings = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        v.*,
        COUNT(DISTINCT uv.user_id) as participant_count,
        SUM(vo.votes_count) as total_votes
      FROM votings v
      LEFT JOIN voting_options vo ON v.id = vo.voting_id
      LEFT JOIN user_votes uv ON v.id = uv.voting_id
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `);

    res.json({ votings: result.rows });
  } catch (error) {
    logger.error('Error fetching all votings:', error);
    res.status(500).json({ error: 'Failed to fetch votings' });
  }
};

// Get voting history
exports.getVotingHistory = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        v.*,
        COUNT(DISTINCT uv.user_id) as participant_count,
        (
          SELECT json_build_object(
            'id', p.id,
            'title', p.title,
            'votes', vo.votes_count
          )
          FROM voting_options vo
          JOIN projects p ON vo.project_id = p.id
          WHERE vo.voting_id = v.id
          ORDER BY vo.votes_count DESC
          LIMIT 1
        ) as winner
      FROM votings v
      LEFT JOIN user_votes uv ON v.id = uv.voting_id
      WHERE v.status = 'closed'
      GROUP BY v.id
      ORDER BY v.end_date DESC
      LIMIT 10
    `);

    res.json({ history: result.rows });
  } catch (error) {
    logger.error('Error fetching voting history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Get user's votes
exports.getUserVotes = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(`
      SELECT 
        v.id as voting_id,
        v.title as voting_title,
        p.title as voted_project,
        uv.voted_at
      FROM user_votes uv
      JOIN votings v ON uv.voting_id = v.id
      JOIN voting_options vo ON uv.option_id = vo.id
      JOIN projects p ON vo.project_id = p.id
      WHERE uv.user_id = $1
      ORDER BY uv.voted_at DESC
    `, [userId]);

    res.json({ votes: result.rows });
  } catch (error) {
    logger.error('Error fetching user votes:', error);
    res.status(500).json({ error: 'Failed to fetch user votes' });
  }
};

// Update voting (ADMIN)
exports.updateVoting = async (req, res) => {
  const { id } = req.params;
  const { title, description, start_date, end_date, status } = req.body;

  try {
    const result = await db.query(`
      UPDATE votings
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          start_date = COALESCE($3, start_date),
          end_date = COALESCE($4, end_date),
          status = COALESCE($5, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [title, description, start_date, end_date, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voting not found' });
    }

    logger.info(`Voting ${id} updated by admin ${req.user.id}`);
    res.json({ 
      message: 'Voting updated successfully', 
      voting: result.rows[0] 
    });
  } catch (error) {
    logger.error('Error updating voting:', error);
    res.status(500).json({ error: 'Failed to update voting' });
  }
};

// Close voting (ADMIN)
exports.closeVoting = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      UPDATE votings
      SET status = 'closed',
          end_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voting not found' });
    }

    logger.info(`Voting ${id} closed by admin ${req.user.id}`);
    res.json({ 
      message: 'Voting closed successfully', 
      voting: result.rows[0] 
    });
  } catch (error) {
    logger.error('Error closing voting:', error);
    res.status(500).json({ error: 'Failed to close voting' });
  }
};

// Delete voting (ADMIN)
exports.deleteVoting = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      DELETE FROM votings WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voting not found' });
    }

    logger.info(`Voting ${id} deleted by admin ${req.user.id}`);
    res.json({ message: 'Voting deleted successfully' });
  } catch (error) {
    logger.error('Error deleting voting:', error);
    res.status(500).json({ error: 'Failed to delete voting' });
  }
};
